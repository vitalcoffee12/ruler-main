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
import { defaultEntity, Entity, ExtendEntity, GameHistory } from "./gameModel";
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
        ...defaultEntity,
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
        "",
        JSON.stringify(entities),
        doc
          .sort(() => Math.random() - 0.5)
          .slice(0, 5)
          .map((d: any) => d.content && d.content[0])
          .join("\n"),
      );

      //const result = gameLib.parseCommand(world, data);

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
        data,
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
  ): Promise<void> {
    try {
      const guild = await this.guildRepository.findOne({
        where: { code: guildCode },
      });
      if (!guild) {
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        return;
      }

      const chatHistories = await gameLib.getFlatChat(guild);

      const userMessage = chatHistories[chatHistories.length - 1].content;
      const { player, rankedLocation, rankedCharacter } =
        await gameLib.rankEntities(guild.code);
      const ranked = [
        player,
        ...rankedLocation.splice(0, 2),
        ...rankedCharacter.splice(0, 2),
      ];
      const world = await gameLib.getWorld(guildCode);

      const turns = [];
      const tasks = [];
      const {
        data: intents,
        prompt: intentPrompt,
        rankedEntities,
      } = await gameLib.extractIntent(userMessage, ranked, chatHistories);

      const entityDescription = `player info : ${JSON.stringify(ExtendToEntity([player]))}
      Ranked locations: ${JSON.stringify(ExtendToEntity(rankedLocation.splice(0, 2)))}
      Ranked characters: ${JSON.stringify(ExtendToEntity(rankedCharacter.splice(0, 2)))};
      `;

      console.log("Extracted intents:", intents);
      tasks.push({
        type: "extract_intent",
        input: intentPrompt,
        output: JSON.stringify({
          intents,
          rankedEntities,
        }),
      });

      for (const intent of intents) {
        if (intent.type === "conversation") {
          const conversation = await this.processConversation(
            guildCode,
            message,
            intent,
          );
          turns.push({
            type: "conversation",
            output: `${intent.target}: ${conversation.data}`,
          });
          tasks.push({
            type: "conversation",
            input: conversation.prompt,
            output: conversation.output,
          });
        } else if (intent.type === "question") {
          await this.processQuestion(guildCode, message, intent);
        } else if (intent.type === "exploration") {
          let targetEntity = world.find((e) => e.name === intent.target);
          const relatedEntity = [];
          if (ranked.find((e) => e.name != intent.target)) {
            const targetEntity = world.find((e) => e.name === intent.target);
            if (targetEntity) {
              relatedEntity.push(targetEntity);
            }
          }
          if (targetEntity && targetEntity.related) {
            targetEntity.related.forEach((relatedName) => {
              const related = world.find((e) => e.name === relatedName);
              if (
                related &&
                related.name !== intent.target &&
                !ranked.find((e) => e.name === related.name)
              ) {
                relatedEntity.push(related);
              }
            });
          }

          if (targetEntity) {
            turns.push({
              type: "exploration",
              output: `Player is exploring about ${intent.target} with intent: ${intent.intent}
              Target entity: ${JSON.stringify(ExtendToEntity([targetEntity]))}
              Related entity: ${JSON.stringify(ExtendToEntity(relatedEntity))}
              `,
            });
            ranked.push(targetEntity);
            await mongoose.connection
              .collection(`${guildCode}${COLLECTION_SUFFIX.WORLD}`)
              .updateOne(
                { name: intent.target },
                { $set: { lastScore: (targetEntity?.lastScore || 0) + 0.5 } },
              );
          } else {
            turns.push({
              type: "exploration",
              output: `Player is exploring about ${intent.target} with intent: ${intent.intent}             
              `,
            });
          }

          tasks.push({
            type: "exploration",
            input: `intent: ${intent.intent}, target: ${intent.target}`,
            output: JSON.stringify({
              intent: intent.intent,
              target: targetEntity ? targetEntity : intent.target,
              related: relatedEntity,
            }),
          });
        } else if (intent.type === "move") {
          const move = await this.processMove(guildCode, message, intent);
          turns.push({
            type: "move",
            output: move.data,
          });
          tasks.push({
            type: "move",
            input: `intent: ${intent.intent}, target: ${intent.target}`,
            output: JSON.stringify(move),
          });
        } else {
          console.log("Unknown intent type:", intent.type);
        }
      }

      const narrative = await this.processExploration(
        guildCode,
        message,
        entityDescription,
        intents.find((i) => i.type === "exploration") || intents[0],
        turns.map((t) => `- ${t.type}, ${t.output}`).join("\n"),
      );
      tasks.push({
        type: "narrative_generation",
        input: narrative.prompt,
        output: narrative.output,
      });

      const responseUser = PREDEFINED_USER.GUILD(guildCode, guildCode);
      await gameLib.insertGameHistory(
        guildCode,
        {
          userId: responseUser.id.toString(),
          userCode: responseUser.code,
          message: narrative.data,
        },
        [],
        [...tasks],
      );
      console.log("Generated narrative:", narrative.data);
      // TODO

      const edits = await gameLib.requestEdit(
        guildCode,
        narrative.data,
        entityDescription,
      );

      await socketHandler.sendWorldUpdate(guildCode);
      await socketHandler.sendChatUpdate(guildCode);
      await socketHandler.sendMessageToGuild(
        MESSAGE_TYPES.AGENT_COMPLETE,
        guildCode,
        {},
      );
      return;
    } catch (ex) {
      console.log(
        "Error processing message:",
        ex instanceof Error ? ex.message : ex,
      );
      return;
    }
  }

  async processMove(
    guildCode: string,
    message: string,
    intent: { type: string; target: string; intent: string },
  ): Promise<{ data: string; output: string }> {
    const world = await gameLib.getWorld(guildCode);
    const location = world.find((e) => e.name === intent.target);
    const player = world.find((e) => e.type === "player");

    console.log("Location or player not found in the world:", intent.target);
    if (!location || !player) {
      return { data: "", output: "" };
    }

    const currentLocation = world.find(
      (e) => e.type === "Location" && e.name === player?.location,
    );
    if (currentLocation?.route?.includes(location.name) === false) {
      console.log(
        "Location is not directly reachable from current location:",
        intent.target,
      );
      return {
        data: `Player tried to move to ${intent.target} but it's not reachable from current location. These locations are directly reachable from current location: ${currentLocation?.route?.join(", ")}`,
        output: "",
      };
    }

    await mongoose.connection
      .collection(`${guildCode}${COLLECTION_SUFFIX.WORLD}`)
      .updateOne({ type: "player" }, { $set: { location: location.name } });

    return { data: `Player moved to ${location.name}`, output: "" };
  }

  async processConversation(
    guildCode: string,
    message: string,
    intent: { type: string; target: string; intent: string },
    previousChat?: { role: string; content: string }[],
  ): Promise<{ data: string; prompt: string; output: string }> {
    const world = await gameLib.getWorld(guildCode);

    const target = world.find((e) => e.name === intent.target);
    const player = world.find((e) => e.type === "player");
    if (!player) {
      console.log("Player entity not found in the world:", intent.target);
      return { data: "", prompt: "", output: "" };
    }
    const related = world.filter((e) => target?.related?.includes(e.name));
    const location = world.find((e) => e.name === player?.location);

    // const rankedEntities = (
    //   await gameLib.rankEntities(guildCode, message)
    // ).slice(0, 5);
    // const narrative = await gameLib.requestNarrative(
    //   intent.data,
    //   message,
    //   [],
    //   ExtendToEntity(rankedEntities as ExtendEntity[]),
    // );
    const entityDescription = `player info : ${JSON.stringify(ExtendToEntity([player]))}
    related entities with NPC: ${JSON.stringify(ExtendToEntity(related))}
    current location info: ${JSON.stringify(ExtendToEntity([location!]))}`;

    let npcDescription;
    if (target) {
      npcDescription = `Name: ${target.name}\nDescription: ${target.description}\nPersonality: ${target.personality}\nBackstory: ${target.backstory}\nAppearance: ${target.appearance}\nMemory: ${target.memory.join("\n")}`;
    } else {
      npcDescription = `Name: ${intent.target}`;
    }

    const { data, prompt } = await agentLib.npcActor(
      message,
      entityDescription,
      npcDescription,
      previousChat,
    );

    // TODO

    return {
      data: data.dialogue,
      prompt,
      output: JSON.stringify({
        intent: intent.target,
        player,
        target,
        related,
        location,
      }),
    };
  }

  async processExploration(
    guildCode: string,
    message: string,
    entityDescription: string,
    intent: { type: string; target: string; intent: string },
    turn: string,
    //intent: { type: string; target: string; intent: string },
  ): Promise<{ data: string; prompt: string; output: string }> {
    const guild = await this.guildRepository.findOne({
      where: { code: guildCode },
    });
    if (!guild) {
      console.log("Guild not found:", guildCode);
      return { data: "", prompt: "", output: "" };
    }

    const chats = await gameLib.getFlatChat(guild);

    const { data, prompt } = await agentLib.generateNarrative(
      message,
      intent.intent,
      turn,
      entityDescription,
      chats.slice(-10, -1),
    );

    return {
      data,
      prompt,
      output: data,
    };
  }

  async processQuestion(
    guildCode: string,
    message: string,
    intent: { type: string; target: string; intent: string },
  ) {}

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
      const chat = await gameLib.getRecentHistory(guildCode, page);
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
