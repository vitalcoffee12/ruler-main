import { ServiceResponse } from "@/common/models/serviceResponse";
import type { Guild, GuildMember, GuildMemberWithUser } from "./guildModel";
import { StatusCodes } from "http-status-codes";
import {
  ExtendToEntity,
  GenerateDocumentCode,
  GenerateGuildCode,
  GenerateRandomColorCode,
} from "../utils";
import { GuildMemberEntity } from "@/entities/guilldMemberEntity";
import { GuildEntity } from "@/entities/guildEntity";
import { UserEntity } from "@/entities/userEntity";
import {
  defaultEntity,
  Entity,
  ExtendEntity,
  GameHistory,
} from "../game/gameModel";
import { gameLib } from "../_lib/game.lib";
import { COLLECTION_SUFFIX, PREDEFINED_USER } from "../constants";
import mongoose from "mongoose";
import { OAUTH_PROVIDERS } from "@/common/constants";
import AppDataSource from "@/dataSource";
import { Repository } from "typeorm/repository/Repository";
import { mongoLib } from "../_lib/mongo.lib";
import { In } from "typeorm";
import { agentLib } from "../_lib/agent.lib";
import { Document } from "../resources/resourceModel";
import { MESSAGE_TYPES, socketHandler } from "../_lib/socketHandler";

export class GuildService {
  constructor(
    private guildRepository: Repository<GuildEntity> = AppDataSource.getRepository(
      GuildEntity,
    ),
    private guildMemberRepository: Repository<GuildMemberEntity> = AppDataSource.getRepository(
      GuildMemberEntity,
    ),
    private userRepository: Repository<UserEntity> = AppDataSource.getRepository(
      UserEntity,
    ),
  ) {}
  async findAll(): Promise<ServiceResponse<Guild[] | null>> {
    try {
      const guilds = await this.guildRepository.find();
      if (!guilds || guilds.length === 0) {
        return ServiceResponse.failure(
          "No guilds found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<Guild[]>(
        "Guilds retrieved successfully",
        guilds,
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

  async findByCode(code: string): Promise<
    ServiceResponse<{
      guild: Guild;
      members: any[];
    } | null>
  > {
    try {
      const guild = await this.guildRepository.findOne({ where: { code } });
      const members = await this.findMembersByGuild({ guildCode: code });

      if (!guild) {
        return ServiceResponse.failure(
          "Guild not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<{
        guild: Guild;
        members: any[];
      }>("Guild retrieved successfully", {
        guild,
        members,
      });
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error retrieving guild: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getHistoryByCode(
    guildCode: string,
    sceneId: number = 0,
  ): Promise<ServiceResponse<GameHistory[] | null>> {
    try {
      const historyData = await gameLib.getHistory(guildCode, 1);
      if (!historyData) {
        return ServiceResponse.failure(
          "No history found for guild",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<GameHistory[]>(
        "History retrieved successfully",
        historyData,
      );
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error retrieving history for guild: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getWorldByCode(
    guildCode: string,
  ): Promise<ServiceResponse<Entity[] | null>> {
    try {
      const historyData = await gameLib.getWorld(guildCode);
      if (!historyData) {
        return ServiceResponse.failure(
          "No world found for guild",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<Entity[]>(
        "World retrieved successfully",
        historyData,
      );
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error retrieving world for guild: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createWithCollections(guildData: {
    code: string;
    ownerId: number;
    name: string;
    description?: string;
    iconPath?: string;
  }): Promise<GuildEntity> {
    const newGuild = new GuildEntity({
      code: guildData.code,
      colorCode: GenerateRandomColorCode(),
      ownerId: guildData.ownerId,
      name: guildData.name,
      description: guildData.description,
      state: "pending",
      iconPath: guildData.iconPath,
    });
    const user = await this.userRepository.findOne({
      where: { id: guildData.ownerId },
    });
    if (!user) {
      throw new Error(`User with ID ${guildData.ownerId} not found`);
    }

    await this.guildRepository.save(newGuild);
    await this.guildMemberRepository.save(
      new GuildMemberEntity({
        guildId: newGuild.id,
        guildCode: newGuild.code,
        userId: guildData.ownerId,
        userCode: user.code, // Assuming userCode is not available at this point
        role: "owner",
        joinedAt: new Date(),
      }),
    );

    await mongoose.connection.createCollection(
      `${newGuild.code}${COLLECTION_SUFFIX.GAME}`,
    );
    await mongoose.connection.createCollection(
      `${newGuild.code}${COLLECTION_SUFFIX.WORLD}`,
    );
    await mongoLib.createEmbeddingIndex(
      `${newGuild.code}${COLLECTION_SUFFIX.WORLD}`,
    );

    await mongoose.connection.createCollection(
      `${newGuild.code}${COLLECTION_SUFFIX.DOCUMENTS}`,
    );

    await mongoose.connection.createCollection(
      `${newGuild.code}${COLLECTION_SUFFIX.SCENARIO}`,
    );
    await mongoLib.createEmbeddingIndex(
      `${newGuild.code}${COLLECTION_SUFFIX.SCENARIO}`,
    );

    await mongoose.connection.createCollection(
      `${newGuild.code}${COLLECTION_SUFFIX.QUEST}`,
    );

    const newCharacter: ExtendEntity = {
      name: user.displayName,
      type: "player",
      description: "",
      isPreferred: true,
      preference: 0,
      lastSceneId: 0,
      lastScore: 0,
      retreivedCount: 0,
      location: "",
      documents: [],
      memory: [],
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    const predUser = PREDEFINED_USER.SYSTEM;
    await gameLib.insertGameHistory(
      newGuild.code,
      {
        userId: predUser.id.toString(),
        userCode: predUser.code,
        message: `Player ${user.displayName} has created the guild.`,
      },
      [newCharacter],
    );

    await mongoose.connection
      .collection(`${newGuild.code}${COLLECTION_SUFFIX.WORLD}`)
      .insertOne(newCharacter);

    const predGuild = PREDEFINED_USER.GUILD(newGuild.code, newGuild.name);
    await gameLib.insertGameHistory(
      newGuild.code,
      {
        userId: predGuild.id.toString(),
        userCode: predGuild.code,
        message: `## Congratulations, \`${newGuild.name}\` has been created!
This is the beginning of your guild chat. Guild members can communicate here, adventure the world, and \`Loggic\` will take a job in guiding your journey!`,
      },
      [],
      [],
    );

    return newGuild;
  }

  async createGuild(createGuildData: {
    iconPath?: string;
    name: string;
    description: string;
    ownerId: number;
    attachment?: string;
  }) {
    try {
      const guildCode = GenerateGuildCode();
      const guild = await this.createWithCollections({
        code: guildCode,
        ownerId: createGuildData.ownerId,
        name: createGuildData.name,
        description: createGuildData.description,
        iconPath:
          createGuildData.iconPath ??
          (createGuildData.iconPath
            ? `guild/${createGuildData.iconPath}`
            : undefined),
      });

      let docs: Document[] = [];

      if (createGuildData.attachment && createGuildData.attachment !== "null") {
        docs = await gameLib.buildDocumentFromMarkdown(
          GenerateDocumentCode(),
          1,
          createGuildData.name,
          `/guild/${createGuildData.attachment}`,
        );
        await mongoose.connection
          .collection(`${guildCode}${COLLECTION_SUFFIX.DOCUMENTS}`)
          .insertMany(docs);
      } else {
        docs = await gameLib.buildDocumentFromMarkdown(
          GenerateDocumentCode(),
          1,
          createGuildData.name,
          `/default/default.md`,
        );
        await mongoose.connection
          .collection(`${guildCode}${COLLECTION_SUFFIX.DOCUMENTS}`)
          .insertMany(docs);
      }

      await socketHandler.sendMessageToUserByUserId(
        MESSAGE_TYPES.GUILD_LIST_UPDATE,
        createGuildData.ownerId,
        {},
      );

      return ServiceResponse.success<Guild>(
        "Guild created successfully",
        guild,
        StatusCodes.CREATED,
      );
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error creating guild: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createGame(guildCode: string, description: string, userId: number) {
    const guild = await this.guildRepository.findOne({
      where: { code: guildCode },
    });

    const docs = await mongoose.connection
      .collection(`${guildCode}${COLLECTION_SUFFIX.DOCUMENTS}`)
      .find({})
      .toArray();

    if (description.length === 0) {
      description = docs[0]?.content?.[0] ?? "No description provided.";
    }
    let entities: Entity[] = [];
    const chatLog: { role: string; content: string }[] = [];
    let chunks = [];
    let chunk = "";

    const regions: { name: string; description: string; related: string[] }[] =
      [];

    for (const doc of docs) {
      if (
        (doc && !doc.content) ||
        !doc?.content.length ||
        doc.content[0].length == 0
      ) {
        chunk += doc?.title;
      } else {
        chunk += doc.content[0];
      }
      if (chunk.length >= 1000) {
        chunks.push(chunk.replaceAll(/[\n\t\r]+/g, " "));
        chunk = "";
      }
    }
    if (chunk.length > 0) {
      chunks.push(chunk.replaceAll(/[\n\t\r]+/g, " "));
    }

    const t: { input?: string; output?: string; type: string }[] = [];
    //let input = "";
    for (let i = 0; i < chunks.length; i++) {
      const { data: regionData, prompt } = await agentLib.extractRegions(
        description,
        JSON.stringify(regions),
        chunks[i],
        chatLog,
      );
      for (const r of regionData) {
        const existing = regions.find(
          (existing) =>
            existing.name === r.name ||
            existing.name.includes(r.name) ||
            r.name.includes(existing.name),
        );

        if (existing) {
          existing.description = r.description;
          existing.related = Array.from(
            new Set([...(existing.related ?? []), ...(r.related ?? [])]),
          );
          existing.related = existing.related?.filter(
            (rel) => rel !== existing.name,
          );
        } else {
          regions.push(r);
        }
      }

      t.push({
        type: `region_extraction_chunk_${i}`,
        input: prompt,
        output: JSON.stringify(regionData),
      });
      chatLog.push({ role: "user", content: JSON.stringify(regionData) });
    }

    const combinedRegions: {
      name: string;
      description: string;
      related: string[];
    }[] = await agentLib.extractRegionCollapse(JSON.stringify(regions));

    t.push({
      type: `region_collapse`,
      input: JSON.stringify(regions),
      output: JSON.stringify(combinedRegions),
    });

    console.log("Combined regions: ", combinedRegions);

    for (let i = 0; i < combinedRegions.length; i++) {
      const r = combinedRegions[i];
      const locations: Entity[] = [];
      const { data: locationData, prompt } = await agentLib.designLocation(
        JSON.stringify(r),
      );
      for (const e of locationData) {
        if (
          entities.some(
            (existing) =>
              existing.name === e.name ||
              existing.name.includes(e.name) ||
              e.name.includes(existing.name),
          )
        ) {
          continue;
        }

        locations.push({
          name: e.name,
          group: r.name,
          description: e.description,
          related: e.related,
          type: "Location",
          location: r.name,
          memory: [e.accessibility.toString()],
          route: [],
        });
      }
      //console.log(`Extracted locations for region ${r.name}: `, locations);
      t.push({
        type: `location_design_region_${i}`,
        input: prompt,
        output: JSON.stringify(locationData),
      });
      entities.push(...locations);

      const chracters: Entity[] = [];
      const { data: characterData, prompt: characterPrompt } =
        await agentLib.designCharacter(
          JSON.stringify(r),
          JSON.stringify(locations),
        );

      for (const e of characterData) {
        if (!e?.location) {
          e.location =
            locations[Math.floor(Math.random() * locations.length)].name;
        }

        if (
          entities.some(
            (existing) =>
              existing.name === e.name ||
              existing.name.includes(e.name) ||
              e.name.includes(existing.name),
          )
        ) {
          continue;
        }

        chracters.push({
          name: e.name,
          location: e.location,
          description: e.description,
          personality: e.personality,
          backstory: e.backstory,
          appearance: e.appearance,
          related: e.related,
          type: "Character",
          memory: [],
        });
      }
      //console.log(`Extracted characters for region ${r.name}: `, chracters);
      entities.push(...chracters);
      t.push({
        type: `character_design_region_${i}`,
        input: characterPrompt,
        output: JSON.stringify(characterData),
      });
    }

    // TODO character design based on location and region
    // for (let i = 0; i < Math.max(chunks.length, atleast); i++) {
    //   if (chunks.length > i) {
    //     input = chunks[i];
    //   } else {
    //     input = chunks[chunks.length - 1];
    //   }

    //   const existingLocation = entities
    //     .filter((e) => e.type === "Location")
    //     .map((e) => {
    //       return `
    //       Name : ${e.name}
    //       Group : ${e.group ?? "N/A"}
    //       Description : ${e.description ?? "N/A"}
    //       Related : ${e.related?.join(", ") ?? "N/A"}
    //       `;
    //     })
    //     .join(" ");

    //   const existingCharacters = entities
    //     .filter((e) => e.type === "Character")
    //     .map((e) => {
    //       return `
    //       Name : ${e.name}
    //       Group : ${e.group ?? "N/A"}
    //       Description : ${e.description ?? "N/A"}
    //       Related : ${e.related?.join(", ") ?? "N/A"}
    //      `;
    //     })
    //     .join("\n");

    //   const { data, prompt } = await agentLib.designGameWorld(
    //     description,
    //     groups.size > 0 ? Array.from(groups).join(", ") : "Not provided yet",
    //     `## existingLocations \n${existingLocation}\n## existingCharacters: \n${existingCharacters}`,
    //     input,
    //     chatLog,
    //   );

    //   for (const e of data) {
    //     if (e.type === "Location" && e.group) {
    //       groups.add(e.group);
    //     }
    //     if (!entities.find((en) => en.name === e.name && en.type === e.type)) {
    //       entities.push(e);
    //     }
    //   }

    //   chatLog.push(
    //     { role: "user", content: input },
    //     { role: "assistant", content: JSON.stringify(entities) },
    //   );
    //   t.push({
    //     type: `initial_chunk_${i}`,
    //     input: prompt,
    //     output: JSON.stringify(data),
    //   });
    // }

    const locations = entities.filter((e) => e.type === "Location");

    // const characters = entities
    //   .filter((e) => e.type === "Character")
    //   .map((e) => e.name);
    // const items = entities.filter((e) => e.type === "Item").map((e) => e.name);
    // const creatures = entities
    //   .filter((e) => e.type === "Creature")
    //   .map((e) => e.name);
    for (const l of locations) {
      const relatedLocation = locations.filter(
        (e) => l.related?.includes(e.name) && e.name !== l.name,
      );

      for (const rl of relatedLocation) {
        if (!l.route?.includes(rl.name)) {
          l.route = l.route ? [...l.route, rl.name] : [rl.name];
        }
        if (!rl.route?.includes(l.name)) {
          rl.route = rl.route ? [...rl.route, l.name] : [l.name];
        }
      }

      if (!l.route || l.route.length === 0) {
        const randomLocation = locations
          .filter((e) => e.name !== l.name && e.group !== l.group)
          .sort(() => Math.random() - 0.5)[0];
        if (randomLocation) {
          l.route = [randomLocation.name];
          if (!randomLocation.route?.includes(l.name)) {
            randomLocation.route = randomLocation.route
              ? [...randomLocation.route, l.name]
              : [l.name];
          }
        }
      }
    }

    for (const r of combinedRegions) {
      let hasOut = false;
      const locationInRegion = locations.filter((e) => e.group === r.name);
      let mostPublicScore = 100;
      let mostPublic;
      for (const l of locationInRegion) {
        const accessibility = l.memory[0] ?? "5";
        if (accessibility && parseInt(accessibility) < mostPublicScore) {
          mostPublicScore = parseInt(accessibility);
          mostPublic = l;
        }
        l.memory = [];
      }

      const relatedRegions = combinedRegions.filter(
        (e) => r.related?.includes(e.name) && e.name !== r.name,
      );

      if (mostPublic) {
        for (const rr of relatedRegions) {
          const outerLocations = locations
            .filter((e) => e.group === rr.name)
            .sort(() => Math.random() - 0.5);

          if (outerLocations) {
            if (
              mostPublic.route &&
              !mostPublic.route.includes(outerLocations[0].name)
            ) {
              mostPublic.route = [...mostPublic.route, outerLocations[0].name];
            }
            if (
              outerLocations[0].route &&
              !outerLocations[0].route.includes(mostPublic.name)
            ) {
              outerLocations[0].route = [
                ...outerLocations[0].route,
                mostPublic.name,
              ];
            }
          }
        }
        hasOut = true;
      }
      if (!hasOut && locationInRegion.length > 0) {
        const randomLocation = locationInRegion.sort(
          () => Math.random() - 0.5,
        )[0];
        const outerLocations = locations
          .filter((e) => e.group !== r.name)
          .sort(() => Math.random() - 0.5)[0];
        if (randomLocation && outerLocations) {
          if (
            randomLocation.route &&
            !randomLocation.route.includes(outerLocations.name)
          ) {
            randomLocation.route = [
              ...randomLocation.route,
              outerLocations.name,
            ];
          }
          if (
            outerLocations.route &&
            !outerLocations.route.includes(randomLocation.name)
          ) {
            outerLocations.route = [
              ...outerLocations.route,
              randomLocation.name,
            ];
          }
        }
      }
    }

    // for (const e of entities) {
    //   if (e.type === "Character" || e.type === "Creature") {
    //     // const relatedLocations =
    //     //   e.related?.filter((r) => locations.includes(r)) || [];
    //     // if (relatedLocations.length > 0) {
    //     //   e.location = relatedLocations.sort((a, b) => Math.random() - 0.5)[0];
    //     // } else {
    //     //   e.location = locations[Math.floor(Math.random() * locations.length)];
    //     // }
    //   }
    //   if (e.type === "Location") {
    //     const routes = new Set<string>();
    //     if (e.route) {
    //       for (const r of e.route) {
    //         routes.add(r);
    //       }
    //     }
    //     const samegroup = entities.filter(
    //       (en) =>
    //         en.group === e.name && en.type === "Location" && en.name !== e.name,
    //     );

    //     if (
    //       samegroup.length > 0 &&
    //       Array.from(routes).includes(samegroup[0].name)
    //     ) {
    //       routes.add(samegroup[0].name);
    //       samegroup[0].route = samegroup[0].route
    //         ? [...samegroup[0].route, e.name]
    //         : [e.name];
    //     }
    //     const related = entities.filter(
    //       (en) =>
    //         e.related?.includes(en.name) &&
    //         en.group != e.group &&
    //         en.type === "Location" &&
    //         en.name !== e.name,
    //     );

    //     if (related.length > 0) {
    //       for (const r of related.slice(0, 2)) {
    //         if (Array.from(routes).includes(r.name)) continue;
    //         routes.add(r.name);
    //         r.route = r.route ? [...r.route, e.name] : [e.name];
    //       }
    //     }

    //     if (routes.size === 0) {
    //       const randomLocations = entities.filter(
    //         (en) => en.type === "Location" && en.name !== e.name,
    //       );
    //       if (randomLocations.length > 0) {
    //         routes.add(
    //           randomLocations[
    //             Math.floor(Math.random() * randomLocations.length)
    //           ].name,
    //         );
    //         randomLocations[0].route = randomLocations[0].route
    //           ? [...randomLocations[0].route, e.name]
    //           : [e.name];
    //       }
    //     }
    //     e.route = Array.from(routes);
    //   }
    // }

    let player = await mongoose.connection
      .collection(`${guildCode}${COLLECTION_SUFFIX.WORLD}`)
      .findOne<Entity>({ type: "player" });
    if (!player) {
      player = { ...defaultEntity, type: "player", name: "Player" };
    }

    player.location = locations.sort(() => Math.random() - 0.5)[0].name;
    entities.push(player);

    await gameLib.insertGameHistory(
      guildCode,
      {
        userId: PREDEFINED_USER.SYSTEM.id.toString(),
        userCode: PREDEFINED_USER.SYSTEM.code,
        message: `Element created: ${entities.length}`,
      },
      [],
      [
        ...t,
        {
          type: "final",
          output: JSON.stringify(entities),
        },
      ],
    );

    if (entities.length > 0) {
      await mongoLib.insertDocumentsToEmptyCollection(
        `${guildCode}${COLLECTION_SUFFIX.WORLD}`,
        entities,
      );
    }

    //const rankedEntities = gameLib.rankEntities(guildCode, "");

    await this.guildRepository.update({ code: guildCode }, { state: "active" });

    // const { data, prompt } = await agentLib.introduceGame(
    //   JSON.stringify(ExtendToEntity(entities as ExtendEntity[])),
    //   description,
    // );

    // const { data: editData, prompt: editPrompt } = await agentLib.editGameWorld(
    //   data,
    //   JSON.stringify(ExtendToEntity(entities as ExtendEntity[])),
    // );

    // const parsedEntities = gameLib.parseCommand(
    //   entities as ExtendEntity[],
    //   editData,
    // );

    // const guildUser = PREDEFINED_USER.GUILD(
    //   guild?.code ?? guildCode,
    //   guild?.name ?? "Unknown Guild",
    // );

    // await gameLib.insertGameHistory(
    //   guildCode,
    //   {
    //     userId: guildUser.id.toString(),
    //     userCode: guildUser.code,
    //     message: data,
    //   },
    //   [],
    //   [{ type: "introduction", input: prompt, output: data }],
    // );

    // await gameLib.insertGameHistory(
    //   guildCode,
    //   {
    //     userId: PREDEFINED_USER.SYSTEM.id.toString(),
    //     userCode: PREDEFINED_USER.SYSTEM.code,
    //     message: "The game world has been edited based on the introduction.",
    //   },
    //   [],
    //   [
    //     {
    //       type: "edit_after_introduction",
    //       input: editPrompt,
    //       output: JSON.stringify(editData),
    //     },
    //   ],
    // );

    // if (entities.length > 0) {
    //   await mongoLib.insertDocumentsToEmptyCollection(
    //     `${guildCode}${COLLECTION_SUFFIX.WORLD}`,
    //     parsedEntities,
    //   );
    // }

    await socketHandler.sendMessageToUserByUserId(
      MESSAGE_TYPES.GUILD_LIST_UPDATE,
      userId,
      {},
    );
  }

  async findGuildsByUser(
    userId: number,
  ): Promise<ServiceResponse<Guild[] | null>> {
    try {
      const guildMember = await this.guildMemberRepository.find({
        where: { userId: userId },
      });
      const guilds = await this.guildRepository.find({
        where: { id: In(guildMember.map((gm) => gm.guildId)) },
      });
      if (!guilds || guilds.length === 0) {
        return ServiceResponse.failure(
          "No guilds found for user",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<Guild[]>(
        "Guilds retrieved successfully",
        guilds,
      );
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error retrieving guilds for user: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateRefreshToken(
    id: number,
    refreshTokenHash: string,
  ): Promise<ServiceResponse<boolean>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      user.refreshTokenHash = refreshTokenHash;
      await this.userRepository.save(user);
      return ServiceResponse.success<boolean>(
        "Refresh token updated successfully",
        true,
        StatusCodes.OK,
      );
    }
    return ServiceResponse.failure<boolean>(
      "User not found",
      false,
      StatusCodes.NOT_FOUND,
    );
  }

  async signIn(
    id: number,
    refreshTokenHash: string,
  ): Promise<ServiceResponse<boolean>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      user.lastSigninAt = new Date();
      await this.userRepository.save(user);
    } else {
      return ServiceResponse.failure<boolean>(
        "User not found",
        false,
        StatusCodes.NOT_FOUND,
      );
    }
    return ServiceResponse.success<boolean>(
      "User signed in successfully",
      true,
      StatusCodes.OK,
    );
  }

  async joinUsersToGuild(
    guild: { guildId?: number; guildCode?: string },
    users: { userId?: number; userCode?: string; role: string }[],
  ): Promise<ServiceResponse<boolean>> {
    let guildEntity = null;
    let userEntities = [];
    if (guild.guildId) {
      guildEntity = await this.guildRepository.findOne({
        where: { id: guild.guildId },
      });
    } else if (guild.guildCode) {
      guildEntity = await this.guildRepository.findOne({
        where: { code: guild.guildCode },
      });
    }
    if (!guildEntity) {
      return ServiceResponse.failure<boolean>(
        "Guild not found",
        false,
        StatusCodes.NOT_FOUND,
      );
    }

    userEntities = await this.userRepository
      .createQueryBuilder("user")
      .where("user.id IN (:userIds) OR user.code IN (:userCodes)", {
        userIds: users
          .filter((u) => u.userId !== undefined)
          .map((u) => u.userId) as number[],
        userCodes: users
          .filter((u) => u.userCode !== undefined)
          .map((u) => u.userCode) as string[],
      })
      .getMany();

    const members: GuildMember[] = [];
    for (const userEntity of userEntities) {
      members.push({
        guildId: guildEntity.id,
        guildCode: guildEntity.code,
        userId: userEntity.id,
        userCode: userEntity.code,
        role: users.find(
          (u) =>
            (u.userId && u.userId === userEntity.id) ||
            (u.userCode && u.userCode === userEntity.code),
        )?.role as string,
        joinedAt: new Date(),
      });
    }

    await this.guildMemberRepository
      .createQueryBuilder("guild_members")
      .insert()
      .into("guild_members")
      .values(members)
      .execute();

    return ServiceResponse.success<boolean>(
      "User(s) added to guild successfully",
      true,
      StatusCodes.OK,
    );
  }

  async findByOAuthId(
    provider: OAUTH_PROVIDERS,
    oauthId: string,
  ): Promise<UserEntity | null> {
    let user: UserEntity | null = null;
    if (provider === OAUTH_PROVIDERS.GOOGLE) {
      user = await this.userRepository.findOne({
        where: { googleId: oauthId },
      });
    } else if (provider === OAUTH_PROVIDERS.GITHUB) {
      user = await this.userRepository.findOne({
        where: { githubId: oauthId },
      });
    } else if (provider === OAUTH_PROVIDERS.KAKAO) {
      user = await this.userRepository.findOne({
        where: { kakaoId: oauthId },
      });
    } else if (provider === OAUTH_PROVIDERS.NAVER) {
      user = await this.userRepository.findOne({
        where: { naverId: oauthId },
      });
    }
    return user || null;
  }

  async updateOAuthId(
    id: number,
    provider: OAUTH_PROVIDERS,
    oauthId: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      if (provider === OAUTH_PROVIDERS.GOOGLE) {
        user.googleId = oauthId;
      } else if (provider === OAUTH_PROVIDERS.KAKAO) {
        user.kakaoId = oauthId;
      } else if (provider === OAUTH_PROVIDERS.NAVER) {
        user.naverId = oauthId;
      }
      await this.userRepository.save(user);
      return true;
    }
    return false;
  }

  async findMembersByGuild(guild: {
    guildId?: number;
    guildCode?: string;
  }): Promise<GuildMemberWithUser[]> {
    let members = [];
    const selects = [
      "user.id AS user_id",
      "user.code AS user_code",
      "user.iconPath AS user_iconPath",
      "user.displayName AS user_displayName",
      "member.iconPath AS member_iconPath",
      "member.displayName AS member_displayName",
      "member.id AS member_id",
      "member.role AS member_role",
      "member.joinedAt AS member_joinedAt",
    ];
    if (guild.guildId) {
      const membersById = await this.userRepository
        .createQueryBuilder("user")
        .innerJoin(GuildMemberEntity, "member", "member.userId = user.id")
        .where("member.guildId = :guildId", { guildId: guild.guildId })
        .select(selects)
        .getRawMany();
      members = membersById;
    }
    if (guild.guildCode) {
      const membersByCode = await this.userRepository
        .createQueryBuilder("user")
        .innerJoin(GuildMemberEntity, "member", "member.userId = user.id")
        .where("member.guildCode = :guildCode", { guildCode: guild.guildCode })
        .select(selects)
        .getRawMany();
      members = membersByCode;
    }

    return members.map((m) => ({
      id: m.member_id,
      userId: m.user_id,
      userCode: m.user_code,
      guildId: guild.guildId ? guild.guildId : 0,
      guildCode: guild.guildCode ? guild.guildCode : "",
      iconPath: m.member_iconPath ? m.member_iconPath : m.user_iconPath,
      displayName: m.member_displayName
        ? m.member_displayName
        : m.user_displayName,
      role: m.member_role,
      joinedAt: m.member_joinedAt,
    }));
  }

  async findGuildByMemberUser(user: {
    userId?: number;
    userCode?: string;
  }): Promise<GuildEntity[]> {
    if (!user.userId && !user.userCode) {
      return [];
    }

    if (user.userCode && !user.userId) {
      const guildsByUserCode = await this.guildRepository
        .createQueryBuilder("guild")
        .innerJoin("guild_members", "member", "member.guildId = guild.id")
        .where("member.userCode = :userCode", { userCode: user.userCode })
        .getMany();
      return guildsByUserCode;
    } else if (!user.userCode && user.userId) {
      const guildsByUserId = await this.guildRepository
        .createQueryBuilder("guild")
        .innerJoin("guild_members", "member", "member.guildId = guild.id")
        .where("member.userId = :userId", { userId: user.userId })
        .getMany();
      return guildsByUserId;
    }
    const guilds = await this.guildRepository
      .createQueryBuilder("guild")
      .innerJoin("guild_members", "member", "member.guildId = guild.id")
      .where("member.userId = :userId OR member.userCode = :userCode", {
        userId: user.userId,
        userCode: user.userCode,
      })
      .getMany();
    return guilds;
  }

  async inviteMember(
    guildCode: string,
    userId: number,
  ): Promise<ServiceResponse<boolean>> {
    try {
      const guild = await this.guildRepository.findOne({
        where: { code: guildCode },
      });
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!guild || !user) {
        return ServiceResponse.failure(
          "Not found",
          false,
          StatusCodes.NOT_FOUND,
        );
      }

      const guildMember = await this.guildMemberRepository.findOne({
        where: { guildCode: guildCode, userId: userId },
      });
      if (!guildMember) {
        const newMember = {
          userId: user.id,
          userCode: user.code,
          displayName: user.displayName,
          guildId: guild.id,
          guildCode: guild.code,
          role: "member",
          joinedAt: new Date(),
        };
        await this.guildMemberRepository.save(newMember);

        await gameLib.insertGameHistory(guild.code, {
          userId: PREDEFINED_USER.SYSTEM.id.toString(),
          userCode: PREDEFINED_USER.SYSTEM.code,
          message: `Player ${user.displayName} has joined the guild.`,
        });

        return ServiceResponse.success<boolean>(
          "User invited to guild successfully",
          true,
          StatusCodes.OK,
        );
      }
      return ServiceResponse.failure(
        "User is already a member of the guild",
        false,
        StatusCodes.CONFLICT,
      );
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error inviting member to guild: ${errorMessage}`,
        false,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async aggregate(guildCode: string): Promise<ServiceResponse<any>> {
    try {
      const guild = await this.guildRepository.findOne({
        where: { code: guildCode },
      });
      if (!guild) {
        return ServiceResponse.failure(
          "Guild not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      const gameHistory = await gameLib.getHistory(guildCode, 0);

      const reponseUser = PREDEFINED_USER.GUILD(guild.code, guild.name);
      const systemUser = PREDEFINED_USER.SYSTEM;

      const returns = [];
      for (let i = 0; i < gameHistory.length; i++) {
        const entry = gameHistory[i];
        if (!entry.chat) continue;

        if (entry.chat.userCode === reponseUser.code) {
          const command = gameHistory[i - 1];
          const system = gameHistory[i + 1];

          const responseTime =
            entry.createdAt.getTime() - command.createdAt.getTime();

          let intents = [];
          let memories = [];
          for (const t of entry.tasks ?? []) {
            if (t.type == "extract_intent") {
              intents = JSON.parse(t.output ?? "{}").intents ?? "[]";
            }
          }

          for (const t of system.tasks ?? []) {
            if (t.type == "edits") {
              memories = JSON.parse(t.output ?? "[]") ?? [];
            }
          }

          returns.push({
            responseTime,
            message: command.chat?.message,
            intents,
            memories,
          });
        }
      }
      return ServiceResponse.success(
        "Guild data aggregated successfully",
        returns,
        StatusCodes.OK,
      );
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error aggregating guild data: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
