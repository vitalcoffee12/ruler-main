import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { Repository } from "typeorm/repository/Repository";
import mongoose from "mongoose";
import AppDataSource from "@/dataSource";
import {
  GenerateEntityCode,
  GenerateGuildCode,
  generateRandomCode,
  GenerateRandomColorCode,
} from "../utils";
import { GuildEntity } from "@/entities/guildEntity";
import { UserEntity } from "@/entities/userEntity";
import { gameLib } from "../_lib/game.lib";
import { agentLib } from "../_lib/agent.lib";
import { PREDEFINED_USER } from "../constants";
import { socketHandler } from "../_lib/socketHandler";
import { Entity } from "./gameModel";

export class GameService {
  constructor(
    private guildRepository: Repository<GuildEntity> = AppDataSource.getRepository(
      GuildEntity,
    ),
    private userRepository: Repository<UserEntity> = AppDataSource.getRepository(
      UserEntity,
    ),
  ) {}

  async addElement(
    guildCode: string,
    element: any,
  ): Promise<ServiceResponse<boolean | null>> {
    try {
      const guild = await this.guildRepository.findOne({
        where: { code: guildCode },
      });
      if (!guild) {
        return ServiceResponse.failure(
          "No guilds found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }

      const newEntity: Entity = {
        id: `${generateRandomCode(6)}_${Date.now().toString().slice(-5)}`,
        name: element.name,
        state: element.state || "unlisted",
        description: element.description,
        score: element.score || 0,
        rules: [],
        updatedAt: new Date(),
        createdAt: new Date(),
      };

      await gameLib.insertGameHistory(guildCode, {
        chat: {
          userId: PREDEFINED_USER.GUILD(guildCode, guild.name).id,
          userCode: PREDEFINED_USER.GUILD(guildCode, guild.name).code,
          message: `Player added new element with name: ${newEntity.name}`,
        },
        entities: [newEntity],
      });

      socketHandler.sendHistoryUpdate(guildCode);

      return ServiceResponse.success<boolean>(
        "Element added successfully",
        true,
      );
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error retrieving guilds: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async requestElement(
    guildCode: string,
    description: string,
  ): Promise<ServiceResponse<boolean | null>> {
    try {
      const guild = await this.guildRepository.findOne({
        where: { code: guildCode },
      });
      if (!guild) {
        return ServiceResponse.failure(
          "No guilds found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      const terms = await gameLib.searchContextualTerms(guildCode, description);
      const world = (await gameLib.getWorld(guildCode)).world;
      const existingIds = world.map((e) => e.id);

      const newIds: string[] = [];
      while (newIds.length < 3) {
        const newId = GenerateEntityCode();
        if (newIds.includes(newId) || existingIds.includes(newId)) {
          continue;
        }
        newIds.push(newId);
      }

      const refs = world
        .slice(0, 5)
        .map(
          (entity) =>
            `\n- id : ${entity.id} / name : ${entity.name}\n    - ${entity.description}`,
        );

      if (refs.length === 0) {
        refs.push("No existing entities found in the world.");
      } else {
        refs.unshift("\nHere are some existing entities in the world:");
      }

      const { data: elements, prompt } = await agentLib.generateEntities(
        description,
        {
          ids: newIds.join(", "),
          terms: terms
            .map((t) => `id: ${t.id} / ${t.term}: ${t.description}`)
            .join("\n"),
          refs: refs.join("\n"),
          maxCounts: 3,
        },
      );

      const responseUser = PREDEFINED_USER.SYSTEM;

      await gameLib.insertGameHistory(guildCode, {
        chat: {
          userId: responseUser.id,
          userCode: responseUser.code,
          message: `Player requested new element with description: ${description}, and the world provided the following suggestions: ${elements
            .map((e) => e.name)
            .join(", ")}`,
        },
        entities: elements,
        rankedTerms: terms.map((t) => ({
          termId: t.id!,
          score: t.score ?? 0,
        })),
        rankedEntities: world.map((e) => ({
          entityId: e.id,
          score: e.score ?? 0,
        })),
        tasks: [
          {
            type: "generate_entities",
            input: prompt,
            output: `${elements.length} elements are created`,
          },
        ],
      });

      socketHandler.sendHistoryUpdate(guildCode);

      return ServiceResponse.success<boolean>(
        "Element requested successfully",
        true,
      );
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error retrieving guilds: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async requestNarrative(
    guildCode: string,
  ): Promise<ServiceResponse<boolean | null>> {
    try {
      const guild = await this.guildRepository.findOne({
        where: { code: guildCode },
      });
      if (!guild) {
        return ServiceResponse.failure(
          "No guilds found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      const terms = await gameLib.searchRankedTerms(guildCode);
      const history = await gameLib.getWorld(guildCode, guild.sceneId - 1);
      const world = history.world;
      const chatHistories = history.gameHistories
        .map((gh) => gh.chat)
        .filter((ch) => ch && ch.message);
      const sceneHistories = history.sceneHistories;

      let logs = `This is a historical players' conversation log, which may contain important information for narrative generation.\n`;

      logs += chatHistories
        .map((ch) => `- ${ch?.userCode}: ${ch?.message}`)
        .join("\n");

      const refs = world
        .slice(0, 5)
        .map(
          (entity) =>
            `\n- id : ${entity.id} / name : ${entity.name}\n    - ${entity.description}`,
        );

      if (refs.length === 0) {
        refs.push("No existing entities found in the world.");
      } else {
        refs.unshift("\nHere are some existing entities in the world:");
      }

      const { data: elements, prompt } = await agentLib.generateNarrative(
        [
          {
            role: "system",
            content: logs,
          },
        ],
        {
          terms: terms
            .map((t) => `id: ${t.id} / ${t.term}: ${t.description}`)
            .join("\n"),
          refs: refs.join("\n"),
        },
      );

      const responseUser = PREDEFINED_USER.SYSTEM;

      await gameLib.insertGameHistory(guildCode, {
        chat: {
          userId: responseUser.id,
          userCode: responseUser.code,
          message: `Player requested new narrative, and the world provided the following suggestions: ${elements
            .map((e: any) => e.name)
            .join(", ")}`,
        },
        entities: elements,
        rankedTerms: terms.map((t) => ({
          termId: t.id!,
          score: t.score ?? 0,
        })),
        rankedEntities: world.map((e) => ({
          entityId: e.id,
          score: e.score ?? 0,
        })),
        tasks: [
          {
            type: "generate_entities",
            input: prompt,
            output: `${elements.length} elements are created`,
          },
        ],
      });

      socketHandler.sendHistoryUpdate(guildCode);

      return ServiceResponse.success<boolean>(
        "Element requested successfully",
        true,
      );
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error retrieving guilds: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
