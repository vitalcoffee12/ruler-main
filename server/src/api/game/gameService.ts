import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { Repository } from "typeorm/repository/Repository";
import mongoose from "mongoose";
import AppDataSource from "@/dataSource";
import { GenerateGuildCode, GenerateRandomColorCode } from "../utils";
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
        name: element.name,
        type: element.type || "Unknown",
        description: element.description,
        scoreDiff: element.scoreDiff || 0,
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

      const world = (await gameLib.getWorld(guildCode)).world;
      const refs = world
        .slice(0, 5)
        .map((entity) => `\n- ${entity.name}: ${entity.description}`);

      if (refs.length === 0) {
        refs.push("No existing entities found in the world.");
      } else {
        refs.unshift("\nHere are some existing entities in the world:");
      }

      const elements = await agentLib.generateEntities(description, {
        refs: refs.join("\n"),
        maxCounts: 5,
      });

      const responseUser = PREDEFINED_USER.GUILD(
        guildCode,
        guild?.name || "Unknown Guild",
      );

      await gameLib.insertGameHistory(guildCode, {
        chat: {
          userId: responseUser.id,
          userCode: responseUser.code,
          message: `Player requested new element with description: ${description}, and the world provided the following suggestions: ${elements
            .map((e) => e.name)
            .join(", ")}`,
        },
        entities: elements,
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
