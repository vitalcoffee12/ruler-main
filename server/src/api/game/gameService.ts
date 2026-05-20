import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { Repository } from "typeorm/repository/Repository";
import mongoose from "mongoose";
import AppDataSource from "@/dataSource";
import { ExtendToEntity, GenerateEntityCode } from "../utils";
import { GuildEntity } from "@/entities/guildEntity";
import { UserEntity } from "@/entities/userEntity";
import { gameLib } from "../_lib/game.lib";
import { agentLib } from "../_lib/agent.lib";
import { COLLECTION_SUFFIX, PREDEFINED_USER } from "../constants";
import { MESSAGE_TYPES, socketHandler } from "../_lib/socketHandler";
import { Entity, ExtendEntity, GameHistory } from "./gameModel";
import { mongoLib } from "../_lib/mongo.lib";

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
        type: element.type,
        state: {},
        location: element.location,
        relations: [],
      };

      await gameLib.insertGameHistory(
        guildCode,
        {
          userId: PREDEFINED_USER.SYSTEM.id.toString(),
          userCode: PREDEFINED_USER.SYSTEM.code,
          message: `Player added new element with name: ${newEntity.name}`,
        },
        [],
        [
          {
            type: "add_entity",
            input: JSON.stringify(newEntity),
            output: "1 element added to the world",
          },
        ],
      );

      await mongoose.connection
        .collection(`${guildCode}${COLLECTION_SUFFIX.WORLD}`)
        .insertOne(newEntity);

      socketHandler.sendWorldUpdate(guildCode);

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
      socketHandler.sendMessageToGuild("GUILD_FLAG_WAITING", guildCode, {});
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
      const world = await gameLib.getWorld(guildCode);
      const entities = world.sort(() => Math.random() - 0.5).slice(0, 10);
      const doc = await mongoLib.findAllDocuments(
        `${guildCode}${COLLECTION_SUFFIX.DOCUMENTS}`,
      );

      const { data, prompt } = await agentLib.designGameWorld(
        description,
        JSON.stringify(entities),
        doc
          .sort(() => Math.random() - 0.5)
          .slice(0, 5)
          .map((d: any) => d.content && d.content[0])
          .join("\n"),
      );

      const result = gameLib.parseCommand(world, data);

      const responseUser = PREDEFINED_USER.SYSTEM;

      await gameLib.insertGameHistory(
        guildCode,
        {
          userId: responseUser.id.toString(),
          userCode: responseUser.code,
          message: `Player requested new element with description: ${description}, check logs for details`,
        },
        [],
        [
          {
            type: "generate_entities",
            input: prompt,
            output: JSON.stringify(data),
          },
        ],
      );

      await mongoLib.insertDocumentsToEmptyCollection(
        `${guildCode}${COLLECTION_SUFFIX.WORLD}`,
        result,
      );

      await socketHandler.sendWorldUpdate(guildCode);
      await socketHandler.sendMessageToGuild("GUILD_FLAG_DOWN", guildCode, {});

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

  async updateElement(
    guildCode: string,
    elementName: string,
    updatedFields: Partial<Entity>,
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

      const world = await gameLib.getWorld(guildCode);
      const elementIndex = world.findIndex((e) => e.name === elementName);
      if (elementIndex === -1) {
        return ServiceResponse.failure(
          "Element not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      const existingElement = world[elementIndex];
      const updatedElement = {
        ...existingElement,
        ...updatedFields,
        lastScore: (existingElement.lastScore ?? 0) + 1,
        updatedAt: new Date(),
      };

      await gameLib.insertGameHistory(
        guildCode,
        {
          userId: PREDEFINED_USER.SYSTEM.id.toString(),
          userCode: PREDEFINED_USER.SYSTEM.code,
          message: `Element updated: ${updatedElement.name}`,
        },
        [updatedElement],
        [
          {
            type: "update_entity",
            input: JSON.stringify(updatedFields),
            output: JSON.stringify(updatedElement),
          },
        ],
      );
      socketHandler.sendWorldUpdate(guildCode);
      return ServiceResponse.success<boolean>(
        "Element updated successfully",
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

  async getElementById(
    guildCode: string,
    elementName: string,
  ): Promise<ServiceResponse<Entity | null>> {
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
      const world = await gameLib.getWorld(guildCode);
      const element = world.find((e) => e.name === elementName);
      if (!element) {
        return ServiceResponse.failure(
          "Element not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<Entity>(
        "Element retrieved successfully",
        element,
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

  async sendMessage(
    userId: number,
    guildCode: string,
    message: string,
  ): Promise<ServiceResponse<boolean>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          false,
          StatusCodes.NOT_FOUND,
        );
      }
      await gameLib.insertGameHistory(
        guildCode,
        {
          userId: userId.toString(),
          userCode: user?.code || "unknown",
          message: message,
        },
        [],
        [],
      );
      await socketHandler.sendMessageToGuild(
        MESSAGE_TYPES.AGENT_PROCESSING,
        guildCode,
        {},
      );
      await socketHandler.sendMessageToGuild(
        MESSAGE_TYPES.GUILD_CHAT_UPDATE,
        guildCode,
        {},
      );
      return ServiceResponse.success<boolean>(
        "Message sent successfully",
        true,
      );
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error sending message: ${errorMessage}`,
        false,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async processMessage(
    userId: number,
    guildCode: string,
    message: string,
  ): Promise<ServiceResponse<boolean>> {
    try {
      const guild = await this.guildRepository.findOne({
        where: { code: guildCode },
      });
      if (!guild) {
        return ServiceResponse.failure(
          "No guilds found",
          false,
          StatusCodes.NOT_FOUND,
        );
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          false,
          StatusCodes.NOT_FOUND,
        );
      }

      const systemUser = PREDEFINED_USER.SYSTEM;
      const responseUser = PREDEFINED_USER.GUILD(guild.code, guild.name);

      const intent = await gameLib.extractIntent(guild);
      console.log("Extracted intent:", intent);
      const rankedEntities = (
        await gameLib.rankEntities(guild.code, message)
      ).slice(0, 5);
      const narrative = await gameLib.requestNarrative(
        intent.data,
        message,
        [],
        ExtendToEntity(rankedEntities as ExtendEntity[]),
      );

      await gameLib.insertGameHistory(
        guild.code,
        {
          userId: responseUser.id.toString(),
          userCode: responseUser.code,
          message: narrative.data,
        },
        ExtendToEntity(rankedEntities as ExtendEntity[]),
        [
          {
            type: "extract_intent",
            input: intent.prompt,
            output: intent.data,
          },
          {
            type: "generate_narrative",
            input: narrative.prompt,
            output: narrative.data,
          },
        ],
      );
      console.log("Generated narrative:", narrative.data);
      // TODO
      guild.sceneId += 1;
      await this.guildRepository.save(guild);

      const edits = await gameLib.requestEdit(
        guild.code,
        ExtendToEntity(rankedEntities as ExtendEntity[]),
        narrative.data,
      );

      console.log("Edit result:", edits);
      await socketHandler.sendMessageToGuild(
        MESSAGE_TYPES.AGENT_COMPLETE,
        guildCode,
        {},
      );
      await socketHandler.sendWorldUpdate(guildCode);
      await socketHandler.sendChatUpdate(guildCode);

      return ServiceResponse.success<boolean>(
        "Message sent successfully",
        true,
      );
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error sending message: ${errorMessage}`,
        false,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getWorld(
    guildCode: string,
    page: number,
  ): Promise<ServiceResponse<{ entities: Entity[]; hasMore: boolean } | null>> {
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
      const worldCount = await mongoose.connection
        .collection(`${guildCode}${COLLECTION_SUFFIX.WORLD}`)
        .countDocuments();
      const world = await gameLib.getWorldByPage(guildCode, page, 20);
      const hasMore = worldCount > page * 20;
      return ServiceResponse.success<{
        entities: Entity[];
        hasMore: boolean;
      } | null>("World retrieved successfully", { entities: world, hasMore });
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error retrieving world: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getChat(
    guildCode: string,
    page: number,
  ): Promise<
    ServiceResponse<{ history: GameHistory[]; hasMore: boolean } | null>
  > {
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
      const chatCount = await mongoose.connection
        .collection(`${guildCode}${COLLECTION_SUFFIX.GAME}`)
        .countDocuments();
      const chat = await gameLib.getHistory(guildCode, page, 20);
      //const hasMore = chatCount > page * 20;
      const hasMore = false;
      return ServiceResponse.success<{
        history: GameHistory[];
        hasMore: boolean;
      } | null>("Chat retrieved successfully", { history: chat, hasMore });
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error retrieving chat: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
