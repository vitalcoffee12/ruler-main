import fs from "fs";
import mongoose from "mongoose";
import {
  defaultEntity,
  defaultExtendEntity,
  Entity,
  ExtendEntity,
  GameHistory,
} from "../game/gameModel";
import { COLLECTION_SUFFIX, IGameCommand, PREDEFINED_USER } from "../constants";
import { Repository } from "typeorm";
import { GuildEntity } from "@/entities/guildEntity";
import AppDataSource from "@/dataSource";
import { agentLib } from "./agent.lib";
import { GuildMemberEntity } from "@/entities/guilldMemberEntity";
import path from "node:path";
import { GenerateEntityCode, removeMarkdownFormatting } from "../utils";
import { Document } from "../resources/resourceModel";
import { string } from "zod";
import { mongoLib } from "./mongo.lib";
import { Guild } from "../guild/guildModel";

// manage game data
export class GameLib {
  constructor(
    private guildRepository: Repository<GuildEntity> = AppDataSource.getRepository(
      GuildEntity,
    ),
    // private guildMemberRepository: Repository<GuildMemberEntity> = AppDataSource.getRepository(
    //   GuildMemberEntity,
    // ),
  ) {}

  // quest operations
  // async getQuests(guildCode: string): Promise<Quest[]> {
  //   return await mongoose.connection
  //     .collection(`${guildCode}${COLLECTION_SUFFIX.QUESTS}`)
  //     .find<Quest>({})
  //     .toArray();
  // }

  async getWorld(
    guildCode: string,
    options?: {
      includeId?: boolean;
      includeEmbedding?: boolean;
    },
  ): Promise<ExtendEntity[]> {
    return await mongoose.connection
      .collection(`${guildCode}${COLLECTION_SUFFIX.WORLD}`)
      .find<ExtendEntity>(
        {
          deletedAt: { $exists: false },
        },
        {
          projection: {
            _id: options?.includeId ? 1 : 0,
            embedding: options?.includeEmbedding ? 1 : 0,
          },
        },
      )
      .toArray();
  }

  async getWorldByPage(
    guildCode: string,
    page: number,
    pageSize: number = 10,
  ): Promise<ExtendEntity[]> {
    const skip = (page - 1) * pageSize;
    return await mongoose.connection
      .collection(`${guildCode}${COLLECTION_SUFFIX.WORLD}`)
      .find<ExtendEntity>({ deletedAt: { $exists: false } })
      .sort({ lastScore: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();
  }

  // game world operations
  async getHistory(
    guildCode: string,
    page: number,
    pageSize: number = 40,
  ): Promise<GameHistory[]> {
    return await mongoose.connection
      .collection(`${guildCode}${COLLECTION_SUFFIX.GAME}`)
      .find<GameHistory>({})
      .toArray();
  }

  // restoreWorld(
  //   latestScene: SceneHistory | null,
  //   gameHistories: GameHistory[],
  //   inlcudeDeleted: boolean = false,
  // ): Entity[] {
  //   const entities = new Map<string, Entity>();

  //   if (latestScene) {
  //     latestScene.entities.forEach((entity) => {
  //       entities.set(entity.id, entity);
  //     });
  //   }

  //   for (const history of gameHistories) {
  //     if (latestScene && history.sceneId < latestScene.id!) {
  //       continue;
  //     }
  //     for (const entity of history.entities) {
  //       const key = `${entity.id}`;
  //       if (!entities.has(key)) {
  //         entities.set(key, { ...entity, score: entity.score ?? 0 });
  //       } else {
  //         const existing = entities.get(key)!;
  //         existing.name = entity.name;
  //         existing.description = entity.description;
  //         existing.state = entity.state;
  //         existing.score = (existing.score ?? 0) + (entity.score ?? 0);
  //         existing.relations = entity.relations;
  //         // existing.documents = entity.documents ?? existing.documents;
  //         // existing.terms = entity.terms ?? existing.terms;
  //         existing.updatedAt = entity.updatedAt;
  //       }
  //     }
  //   }
  //   return Array.from(entities.values())
  //     .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  //     .filter((e) => (inlcudeDeleted ? e.state !== "removed" : true));
  // }

  // insert single game history document into the guild-specific collection
  async insertGameHistory(
    guildCode: string,
    chat?: { userId: string; userCode: string; message: string },
    entities?: Entity[],
    tasks?: { type: string; input?: string; output?: string }[],
  ) {
    const guild = await this.guildRepository.findOne({
      where: { code: guildCode },
      select: { sceneId: true },
    });
    if (!guild) {
      throw new Error(`Guild with code ${guildCode} not found`);
    }
    const collection = mongoose.connection.collection(
      `${guildCode}${COLLECTION_SUFFIX.GAME}`,
    );
    await collection.insertOne({
      chat,
      entities,
      tasks,
      sceneId: guild?.sceneId,
      createdAt: new Date(),
    });
  }

  // insert single scene history document into the guild-specific collection and update guild's sceneId, game history
  // async insertSceneHistory(
  //   guildCode: string,
  //   sceneId: number,
  //   data: SceneHistory,
  // ) {
  //   try {
  //     const collection = mongoose.connection.collection(
  //       `${guildCode}${COLLECTION_SUFFIX.SCENE_HISTORY}`,
  //     );
  //     await collection.insertOne({
  //       ...data,
  //       sceneId: sceneId,
  //       createdAt: new Date(),
  //     });
  //   } catch (error) {
  //     console.error("Error inserting scene history:", error);
  //     throw error;
  //   }
  // }

  // // history operations
  // async findGameHistoriesBySceneId(
  //   guildCode: string,
  //   sceneId: number,
  // ): Promise<GameHistory[]> {
  //   const collection = mongoose.connection.collection(
  //     `${guildCode}${COLLECTION_SUFFIX.GAME_HISTORY}`,
  //   );
  //   const docs = await collection
  //     .find<GameHistory>({ sceneId })
  //     .sort({ createdAt: 1 })
  //     .toArray();
  //   return docs as GameHistory[];
  // }

  // async findLatestSceneHistories(
  //   guildCode: string,
  //   count: number = -1,
  // ): Promise<SceneHistory[]> {
  //   const collection = mongoose.connection.collection(
  //     `${guildCode}${COLLECTION_SUFFIX.SCENE_HISTORY}`,
  //   );
  //   if (count === -1) {
  //     const allDocs = await collection
  //       .find<SceneHistory>({})
  //       .sort({ createdAt: -1 })
  //       .toArray();
  //     return allDocs as SceneHistory[];
  //   } else {
  //     const doc = await collection
  //       .find<SceneHistory>({})
  //       .sort({ createdAt: -1 })
  //       .limit(count)
  //       .toArray();
  //     return doc as SceneHistory[];
  //   }
  // }

  // async findSceneHistoryBySceneId(
  //   guildCode: string,
  //   sceneId: number,
  // ): Promise<SceneHistory | null> {
  //   const collection = mongoose.connection.collection(
  //     `${guildCode}${COLLECTION_SUFFIX.SCENE_HISTORY}`,
  //   );
  //   const doc = await collection.findOne<SceneHistory>({ sceneId });
  //   return doc as SceneHistory | null;
  // }

  // async importRuleSetToGuildRuleSet(
  //   guildCode: string,
  //   code: string,
  // ): Promise<number> {
  //   const ruleSet = await mongoose.connection
  //     .collection(`${code}.${COLLECTION_SUFFIX.RULE_SET}`)
  //     .find<Rule>({})
  //     .toArray();
  //   await mongoose.connection
  //     .collection(`${guildCode}${COLLECTION_SUFFIX.RULE_SET}`)
  //     .insertMany(ruleSet);

  //   return await mongoose.connection
  //     .collection(`${guildCode}${COLLECTION_SUFFIX.RULE_SET}`)
  //     .countDocuments();
  // }

  // async findRulesFromRuleSet(
  //   code: string,
  //   searchKeywords: string[],
  //   limit: number = 10,
  // ) {
  //   const exactMatch = await mongoose.connection
  //     .collection(`${code}${COLLECTION_SUFFIX.RULE_SET}`)
  //     .find<Rule>({
  //       title: { $in: searchKeywords },
  //     })
  //     .toArray();

  //   const keywordMatch = await mongoose.connection
  //     .collection(`${code}${COLLECTION_SUFFIX.RULE_SET}`)
  //     .find<Rule>({ keywords: { $in: searchKeywords } })
  //     .toArray();

  //   if (exactMatch.length + keywordMatch.length >= limit) {
  //     return [...exactMatch, ...keywordMatch];
  //   }

  //   return [...exactMatch, ...keywordMatch];
  //   // fill the rest with context matches
  //   // TODO: improve relevance scoring
  //   const contextMatch = await mongoose.connection
  //     .collection(`${code}${COLLECTION_SUFFIX.RULE_SET}`)
  //     .find<Rule>({ content: { $in: searchKeywords } })
  //     .toArray();
  //   if (exactMatch.length > 0) {
  //     return exactMatch;
  //   }
  // }

  // // term set operations
  // async insertTermToTermSet(code: string, terms: Term[]) {
  //   const termSet = await mongoose.connection
  //     .collection(`${code}${COLLECTION_SUFFIX.TERM_SET}`)
  //     .insertMany(terms);
  //   return termSet;
  // }

  // async importTermSetToGuildTermSet(
  //   guildCode: string,
  //   code: string,
  // ): Promise<number> {
  //   const termSet = await mongoose.connection
  //     .collection(`${code}.${COLLECTION_SUFFIX.TERM_SET}`)
  //     .find<Term>({})
  //     .toArray();
  //   await mongoose.connection
  //     .collection(`${guildCode}${COLLECTION_SUFFIX.TERM_SET}`)
  //     .insertMany(termSet);
  //   return await mongoose.connection
  //     .collection(`${guildCode}${COLLECTION_SUFFIX.TERM_SET}`)
  //     .countDocuments();
  // }

  // async findTermsFromTermSet(
  //   guildCode: string,
  //   searchKeywords: string[],
  //   limit: number = 10,
  // ) {
  //   const exactMatch = await mongoose.connection
  //     .collection(`${guildCode}${COLLECTION_SUFFIX.TERM_SET}`)
  //     .find<Term>({
  //       term: { $in: searchKeywords },
  //     })
  //     .toArray();

  //   return [...exactMatch];
  //   // fill the rest with context matches
  //   // TODO: improve relevance scoring
  //   const contextMatch = await mongoose.connection
  //     .collection(`${guildCode}${COLLECTION_SUFFIX.TERM_SET}`)
  //     .find<Term>({ definition: { $in: searchKeywords } })
  //     .toArray();
  //   if (exactMatch.length > 0) {
  //     return exactMatch;
  //   }
  // }

  // async searchRankedTerms(guildCode: string): Promise<Term[]> {
  //   const termSet = await mongoose.connection
  //     .collection(`${guildCode}${COLLECTION_SUFFIX.TERM_SET}`)
  //     .find<Term>({})
  //     .sort({ score: 1 })
  //     .limit(10)
  //     .toArray();

  //   return termSet;
  // }

  // async searchContextualTerms(
  //   guildCode: string,
  //   queryString: string,
  // ): Promise<Term[]> {
  //   const embedding = await agentLib.embedText(queryString);
  //   if (!embedding) {
  //     return [];
  //   }

  //   const termSet = await mongoLib.searchByEmbedding(
  //     `${guildCode}${COLLECTION_SUFFIX.TERM_SET}`,
  //     embedding,
  //   );

  //   return termSet.sort((a, b) => (b.version ?? 0) - (a.version ?? 0));
  // }
  parseCommand(
    world: ExtendEntity[],
    commands: IGameCommand[],
    lastSceneId: number = 0,
  ): ExtendEntity[] {
    for (const commandObj of commands) {
      const { command, args } = commandObj;
      if (command.length === 0) {
        continue;
      }
      switch (command) {
        case "CREATE_ENTITY":
          {
            const [name, type] = args;
            if (world.find((e) => e.name === name)) {
              break;
            }
            const newEntity: ExtendEntity = {
              ...defaultExtendEntity,
              name,
              type,
              state: {},
              lastSceneId,
            };
            world.push(newEntity);
          }
          break;
        case "SET_LOCATION":
          {
            const [name, location] = args;
            const entity = world.find((e) => e.name === name);
            if (entity) {
              entity.location = location;
              entity.lastSceneId = lastSceneId;
            }
          }
          break;
        case "ADD_RELATION":
          {
            const [sourceName, relation, targetName] = args;
            if (sourceName == targetName) {
              break; // don't allow self-relation for now, can be updated later if needed
            }
            const source = world.find((e) => e.name === sourceName);
            const target = world.find((e) => e.name === targetName);
            if (source && target) {
              source.relations = source.relations || [];
              source.relations.push({ name: targetName, type: relation });
              source.lastSceneId = lastSceneId;
            }
          }
          break;
        case "REMOVE_RELATION":
          {
            const [sourceName, relation, targetName] = args;
            const source = world.find((e) => e.name === sourceName);
            const target = world.find((e) => e.name === targetName);
            if (source && target) {
              source.relations = source.relations || [];
              source.relations = source.relations.filter(
                (r) => r.name !== targetName || r.type !== relation,
              );
              source.lastSceneId = lastSceneId;
              target.lastSceneId = lastSceneId;
            }
          }
          break;
        case "SET_STATE":
          {
            const [name, key, value] = args;
            const entity = world.find((e) => e.name === name);
            if (entity) {
              if (key == "location" || key == "Location") {
                entity.location = value;
              } else {
                entity.state = entity.state || {};
                entity.state[key] = value;
              }
              entity.lastSceneId = lastSceneId;
            }
          }
          break;
        case "REMOVE_ENTITY":
          {
            const [name] = args;
            const removed = world.find((e) => e.name === name);
            if (removed) {
              removed.lastSceneId = lastSceneId;
              removed.deletedAt = new Date();
            }
          }
          break;
        default:
          break;
      }
    }
    return world;
  }

  async generateIntro(guildCode: string): Promise<string> {
    const world = await this.getWorld(guildCode);
    const description = world;
    return "";
  }

  async extractIntent(guild: Guild): Promise<{ data: string; prompt: string }> {
    const systemUser = PREDEFINED_USER.SYSTEM;
    const responseUser = PREDEFINED_USER.GUILD(guild.code, guild.name);

    const history = await this.getHistory(guild.code, 1);
    const chatHistories = history
      .filter(
        (gh) => gh.chat && gh.chat.message && gh.chat.userId !== systemUser.id,
      )
      .map((ch) => {
        if (ch.chat?.userId === responseUser.id) {
          return { role: "assistant", content: ch.chat?.message ?? "" };
        } else return { role: "user", content: ch.chat?.message ?? "" };
      });

    const userMessage = chatHistories[chatHistories.length - 1].content;
    const { data: intent, prompt: promptExtractIntent } =
      await agentLib.extractIntent(userMessage, chatHistories.slice(-10, -1));

    console.log("Extracted intent:", intent);
    return { data: intent, prompt: promptExtractIntent };
  }

  async rankEntities(
    guildCode: string,
    userIntent: string,
  ): Promise<ExtendEntity[]> {
    const world = await this.getWorld(guildCode);

    const ranked = [] as ExtendEntity[];
    const player = world.find((e) => e.type === "player");
    const entities = world.filter((e) => e.type !== "player");
    // const embedIntent = await agentLib.embedText(userIntent);
    // const rankedByContext = await mongoLib.searchByEmbedding(
    //   `${guildCode}${COLLECTION_SUFFIX.WORLD}`,
    //   embedIntent ?? [],
    //   10,
    // );

    const maxPreference = Math.max(
      ...entities.map((e) => e.preference ?? 0),
      0,
    );
    const maxRetreived = Math.max(
      ...entities.map((e) => e.retreivedCount ?? 0),
      0,
    );
    const maxScore = Math.max(...entities.map((e) => e.lastScore ?? 0), 0);
    const maxRelations = Math.max(
      ...entities.map((e) => e.relations?.length ?? 0),
      0,
    );

    for (const entity of entities) {
      let score = 0;
      score += entity.isPreferred ? 1 : 0;
      score += (entity.preference ?? 0) / (maxPreference || 1);
      score += (entity.retreivedCount ?? 0) / (maxRetreived || 1);
      score += (entity.lastScore ?? 0) / (maxScore || 1);
      score += (entity.relations?.length ?? 0) / (maxRelations || 1);
      // const contextIndex = rankedByContext.findIndex(
      //   (e) => e.name === entity.name,
      // );
      // if (contextIndex !== -1) {
      //   score += (10 - contextIndex) * 0.1;
      // }
      if (entity.relations?.find((r) => r.name === player?.name)) {
        score += 0.5;
      }
      if (player?.relations.find((r) => r.name === entity.name)) {
        score += 0.5;
      }
      if (player?.location === entity.location) {
        score += 1;
      }

      ranked.push({ ...entity, lastScore: score });
    }

    return [
      player as ExtendEntity,
      ...ranked.sort((a, b) => (b.lastScore ?? 0) - (a.lastScore ?? 0)),
    ];
  }

  async requestNarrative(
    intent: string,
    userMessage: string,
    chatHistories: any[],
    rankedEntities: Entity[],
  ): Promise<{ data: string; prompt: string }> {
    try {
      const result = await agentLib.generateNarrative(
        userMessage,
        intent,
        JSON.stringify(rankedEntities),
        chatHistories.slice(-10, -1),
      );

      return result;
    } catch (ex) {
      console.error("Error in requestNarrative:", ex);
      return { data: "", prompt: "" };
    }
  }

  async requestEdit(
    guildCode: string,
    rankedEntities: Entity[],
    narrative: string,
  ): Promise<boolean | null> {
    try {
      const guild = await this.guildRepository.findOne({
        where: { code: guildCode },
      });
      if (!guild) {
        return null;
      }
      const responseUser = PREDEFINED_USER.SYSTEM;

      const world = await this.getWorld(guildCode, { includeId: true });
      const { data, prompt } = await agentLib.editGameWorld(
        narrative,
        JSON.stringify(rankedEntities),
      );
      const updatedWorld = this.parseCommand(world, data);

      await this.insertGameHistory(
        guildCode,
        {
          userId: responseUser.id.toString(),
          userCode: responseUser.code,
          message: `The game world has been updated. Check the change logs for details.`,
        },
        [],
        [
          {
            type: "edits",
            input: prompt,
            output: JSON.stringify(data),
          },
        ],
      );

      await mongoLib.insertDocumentsToEmptyCollection(
        `${guildCode}${COLLECTION_SUFFIX.WORLD}`,
        updatedWorld,
      );

      return true;
    } catch (ex) {
      console.error("Error in requestEdit:", ex);
      return null;
    }
  }

  splitDocument(title: string, markdown: string, level: number): Paragraph {
    const result: Paragraph = {
      title: removeMarkdownFormatting(title),
      content: [],
      level,
      children: [],
    };

    if (level > 6) {
      result.content = [`${title}\n${markdown.trim()}`];
      return result;
    }

    const regex = new RegExp(`^#{${level + 1}} `, "gm");
    const items = markdown.split(regex);

    const children = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].trim() === "") {
        continue;
      }
      if (i === 0 && !items[i].includes("# ")) {
        // const contents = items[i].trim().replaceAll("---", "").split("\n");
        // let paragraphs = "";
        // for (const line of contents) {
        //   paragraphs += line.trim() + "\n";
        //   if (false && paragraphs.trim().length > 400) {
        //     result.content.push(paragraphs.trim());
        //     paragraphs = "";
        //   }
        // }
        // if (paragraphs.trim().length > 0) result.content.push(paragraphs.trim());
        // if (result.content.length) {
        //   result.content[0] = `${title}\n${result.content[0]}`;
        // }
        const content = items[i]
          .trim()
          .replaceAll("---", "")
          .replaceAll("(\n)+", "\n");
        result.content[0] = `${title}\n${content}`;
        continue;
      }

      const subtitle = items[i].split("\n")[0].trim();
      const content = items[i].substring(subtitle.length).trim();

      const child = this.splitDocument(subtitle, content, level + 1);
      // process each item
      children.push(child);
    }
    result.children = children;
    return result;
  }

  // flat nested rule and give unique id for each item (3)
  flatDocumentTree(
    docCode: string,
    docVersion: number,
    startId: number,
    categories: string[],
    paragraph: Paragraph,
  ): { docs: Document[]; endId: number } {
    const docs: Document[] = [];
    const subCategories = [...categories, paragraph.title];
    const doc: Document = {
      id: startId,
      docCode,
      docVersion,
      title: paragraph.title,
      content: paragraph.content,
      categories: subCategories,
      children: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const childDocs = [];
    let currentId = startId + 1;
    for (let i = 0; i < paragraph.children.length; i++) {
      doc.children!.push(currentId);
      const child = paragraph.children[i];
      const childRules = this.flatDocumentTree(
        docCode,
        docVersion,
        currentId,
        subCategories,
        child,
      );
      childDocs.push(...childRules.docs);
      currentId = childRules.endId;
    }

    docs.push(doc);
    docs.push(...childDocs);

    return { docs, endId: currentId };
  }

  // given markdown file, build rules (2)
  async buildDocumentFromMarkdown(
    docCode: string,
    docVersion: number,
    docName: string,
    filename: string = "Blades-in-the-Dark-SRD.md",
  ): Promise<Document[]> {
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "uploads",
      filename,
    );
    const buffer = (
      await fs.promises.readFile(filePath, { encoding: "utf-8" })
    ).replaceAll("\\", "");
    const docTree = this.splitDocument(docName, buffer, 0);
    return this.flatDocumentTree(docCode, docVersion, 1, [], docTree).docs;
  }
}

interface Paragraph {
  title: string;
  content: string[];
  level: number;
  children: Paragraph[];
}

export const gameLib = new GameLib();
