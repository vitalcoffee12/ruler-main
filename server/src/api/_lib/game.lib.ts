import fs from "fs";
import mongoose from "mongoose";
import { Entity, GameHistory, Quest, SceneHistory } from "../game/gameModel";
import { COLLECTION_SUFFIX, PREDEFINED_USER } from "../constants";
import { Repository } from "typeorm";
import { GuildEntity } from "@/entities/guildEntity";
import AppDataSource from "@/dataSource";
import { agentLib } from "./agent.lib";
import { GuildMemberEntity } from "@/entities/guilldMemberEntity";
import path from "node:path";
import { removeMarkdownFormatting } from "../utils";
import { Document } from "../resources/resourceModel";

// manage game data
export class GameLib {
  constructor(
    private guildRepository: Repository<GuildEntity> = AppDataSource.getRepository(
      GuildEntity,
    ),
    private guildMemberRepository: Repository<GuildMemberEntity> = AppDataSource.getRepository(
      GuildMemberEntity,
    ),
  ) {}

  // quest operations
  async getQuests(guildCode: string): Promise<Quest[]> {
    return await mongoose.connection
      .collection(`${guildCode}${COLLECTION_SUFFIX.QUESTS}`)
      .find<Quest>({})
      .toArray();
  }

  // game world operations
  async getHistory(
    guildCode: string,
    sceneId: number = 0,
  ): Promise<{
    sceneHistories: SceneHistory[];
    gameHistories: GameHistory[];
    world: Entity[];
  }> {
    const sceneHistories = await this.findLatestSceneHistories(
      guildCode,
      sceneId - 1,
    );
    const gameHistories = await mongoose.connection
      .collection(`${guildCode}${COLLECTION_SUFFIX.GAME_HISTORY}`)
      .find<GameHistory>({})
      .toArray();
    return {
      sceneHistories,
      gameHistories,
      world: this.restoreWorld(sceneHistories[0] ?? null, gameHistories),
    };
  }

  restoreWorld(
    latestScene: SceneHistory | null,
    gameHistories: GameHistory[],
    inlcudeDeleted: boolean = false,
  ): Entity[] {
    const entities = new Map<string, Entity>();

    if (latestScene) {
      latestScene.entities.forEach((entity) => {
        entities.set(entity.id, entity);
      });
    }

    for (const history of gameHistories) {
      if (latestScene && history.sceneId < latestScene.id!) {
        continue;
      }
      for (const entity of history.entities) {
        const key = `${entity.id}`;
        if (!entities.has(key)) {
          entities.set(key, { ...entity, score: entity.score ?? 0 });
        } else {
          const existing = entities.get(key)!;
          existing.name = entity.name;
          existing.description = entity.description;
          existing.state = entity.state;
          existing.score = (existing.score ?? 0) + (entity.score ?? 0);
          existing.relations = entity.relations;
          // existing.documents = entity.documents ?? existing.documents;
          // existing.terms = entity.terms ?? existing.terms;
          existing.updatedAt = entity.updatedAt;
        }
      }
    }
    return Array.from(entities.values())
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .filter((e) => (inlcudeDeleted ? e.state !== "removed" : true));
  }

  // insert single game history document into the guild-specific collection
  async insertGameHistory(
    guildCode: string,
    data: Pick<GameHistory, "chat" | "entities" | "tasks">,
  ) {
    const guild = await this.guildRepository.findOne({
      where: { code: guildCode },
      select: { sceneId: true },
    });

    if (!guild) {
      throw new Error(`Guild with code ${guildCode} not found`);
    }

    const collection = mongoose.connection.collection(
      `${guildCode}${COLLECTION_SUFFIX.GAME_HISTORY}`,
    );
    await collection.insertOne({
      ...data,
      sceneId: guild?.sceneId,
      createdAt: new Date(),
    });
  }

  // insert single scene history document into the guild-specific collection and update guild's sceneId, game history
  async insertSceneHistory(
    guildCode: string,
    sceneId: number,
    data: SceneHistory,
  ) {
    try {
      const collection = mongoose.connection.collection(
        `${guildCode}${COLLECTION_SUFFIX.SCENE_HISTORY}`,
      );
      await collection.insertOne({
        ...data,
        sceneId: sceneId,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error inserting scene history:", error);
      throw error;
    }
  }

  // history operations
  async findGameHistoriesBySceneId(
    guildCode: string,
    sceneId: number,
  ): Promise<GameHistory[]> {
    const collection = mongoose.connection.collection(
      `${guildCode}${COLLECTION_SUFFIX.GAME_HISTORY}`,
    );
    const docs = await collection
      .find<GameHistory>({ sceneId })
      .sort({ createdAt: 1 })
      .toArray();
    return docs as GameHistory[];
  }

  async findLatestSceneHistories(
    guildCode: string,
    count: number = -1,
  ): Promise<SceneHistory[]> {
    const collection = mongoose.connection.collection(
      `${guildCode}${COLLECTION_SUFFIX.SCENE_HISTORY}`,
    );
    if (count === -1) {
      const allDocs = await collection
        .find<SceneHistory>({})
        .sort({ createdAt: -1 })
        .toArray();
      return allDocs as SceneHistory[];
    } else {
      const doc = await collection
        .find<SceneHistory>({})
        .sort({ createdAt: -1 })
        .limit(count)
        .toArray();
      return doc as SceneHistory[];
    }
  }

  async findSceneHistoryBySceneId(
    guildCode: string,
    sceneId: number,
  ): Promise<SceneHistory | null> {
    const collection = mongoose.connection.collection(
      `${guildCode}${COLLECTION_SUFFIX.SCENE_HISTORY}`,
    );
    const doc = await collection.findOne<SceneHistory>({ sceneId });
    return doc as SceneHistory | null;
  }

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

  async requestNarrative(guildCode: string): Promise<{
    memberCodes: string;
    narrative: string;
    sceneDescription: string;
    // documents: string;
    // terms: string;
    entities: string;
  } | null> {
    try {
      const guild = await this.guildRepository.findOne({
        where: { code: guildCode },
      });
      if (!guild) {
        return null;
      }
      // const guildMembers = await this.guildMemberRepository.createQueryBuilder("guildMember").leftJoin("user", "user", "guildMember.userId = user.id").where("guildMember.guildCode = :guildCode", { guildCode }).getMany();

      const guildMembers = await this.guildMemberRepository.find({
        where: { guildCode },
      });

      const memberCodes = guildMembers.map((v) => v.userCode);

      const systemUser = PREDEFINED_USER.SYSTEM;
      const responseUser = PREDEFINED_USER.GUILD(guildCode, guild.name);
      //const terms = await this.searchRankedTerms(guildCode);
      const history = await this.getHistory(guildCode, guild.sceneId - 1);
      const world = history.world;
      const chatHistories = history.gameHistories
        .filter(
          (gh) =>
            gh.chat &&
            gh.chat.message &&
            gh.chat.userId !== responseUser.id &&
            gh.chat.userId !== systemUser.id,
        )
        .map((ch) => `[${ch?.chat?.userCode}] ${ch?.chat?.message}`);
      const sceneHistories = history.sceneHistories;
      let prevScene = "";
      if (sceneHistories.length > 0) {
        const latestScene = sceneHistories[sceneHistories.length - 1];
        prevScene = latestScene.message;
      }

      const playerCharacters = world.filter((e) => memberCodes.includes(e.id));
      const entities = world
        .filter((e) => !memberCodes.includes(e.id))
        .slice(0, 5)
        .map(
          (entity) =>
            `[${entity.id}] ${entity.name}: ${entity.description} (${entity.secrets})`,
        );

      entities.unshift(
        ...playerCharacters.map(
          (entity) => `[${entity.id}] ${entity.name}: ${entity.description}`,
        ),
      );

      const { data, prompt } = await agentLib.generateNarrative(
        memberCodes.join(", "),
        {
          chatHistories: chatHistories.join("\n") || "No chat history",
          prevScene: prevScene || "No previous scene",
          // documents: "",
          // terms: terms
          //   .map((t) => `[${t.id}] ${t.term}: ${t.description}`)
          //   .join("\n"),
          entities: entities.join("\n"),
        },
      );

      await this.insertGameHistory(guildCode, {
        chat: {
          userId: responseUser.id,
          userCode: responseUser.code,
          message: data.content,
        },
        entities: [],
        tasks: [
          {
            type: "generate_narrative",
            input: prompt,
            output: data.content,
          },
        ],
        // documents: data.documents?.map((d) => ({
        //   id: d.id,
        //   comment: d.comment,
        // })),
        // terms: data.terms?.map((t) => ({
        //   id: t.id,
        //   comment: t.comment,
        // })),
      });

      await this.insertSceneHistory(guildCode, guild.sceneId, {
        message: data.content,
        sceneDescription: data.summary,
        gameHistories: history.gameHistories,
        tasks: [
          {
            type: "generate_narrative",
            input: prompt,
            output: data.content,
          },
        ],
        // documents: data.documents?.map((d) => ({
        //   id: d.id,
        //   comment: d.comment,
        // })),
        // terms: data.terms?.map((t) => ({
        //   id: t.id,
        //   comment: t.comment,
        // })),
        entities: world,
        createdAt: new Date(),
      });
      guild.sceneId += 1;
      await this.guildRepository.save(guild);

      return {
        memberCodes: memberCodes.join(", "),
        narrative: data.content,
        sceneDescription: data.summary,
        //  documents: "",
        //  terms: terms
        //     .map((t) => `[${t.id}] ${t.term}: ${t.description}`)
        //     .join("\n"),
        entities: entities.join("\n"),
      };
    } catch (ex) {
      console.error("Error in requestNarrative:", ex);
      return null;
    }
  }

  async requestEdit(
    previousData: {
      memberCodes: string;
      narrative: string;
      sceneDescription: string;
      entities: string;
    },
    guildCode: string,
  ): Promise<boolean | null> {
    try {
      const guild = await this.guildRepository.findOne({
        where: { code: guildCode },
      });
      if (!guild) {
        return null;
      }

      const responseUser = PREDEFINED_USER.SYSTEM;
      // const terms = await this.searchRankedTerms(guildCode);
      // const history = await this.getWorld(guildCode, guild.sceneId - 1);
      // const world = history.world;
      // const sceneHistories = history.sceneHistories;

      // const entities = world
      //   .slice(0, 5)
      //   .map(
      //     (entity) =>
      //       `[${entity.id}] ${entity.name}: ${entity.description} (${entity.info})`,
      //   );

      const { data, prompt } = await agentLib.generateEdits({
        players: previousData.memberCodes || "No players",
        narrative: previousData.narrative || "No previous narrative",
        sceneDescription: previousData.sceneDescription || "No previous scene",
        // documents: previousData.documents || "No previous documents",
        // terms: previousData.terms || "No previous terms",
        entities: previousData.entities || "No previous entities",
      });

      await this.insertGameHistory(guildCode, {
        chat: {
          userId: responseUser.id,
          userCode: responseUser.code,
          message: `The game world has been edited. ${data.length} updated. Check the latest scene for details.`,
        },
        entities: [
          ...data.map((e) => ({
            ...e,
            id: e.name.replace(/[\[\]]/g, ""),
            score: 1,
            relations: [
              ...e.relations.map((r) => ({
                id: r.id.replace(/[\[\]]/g, ""),
                type: r.type,
                score: 1,
              })),
            ],
          })),
        ],
        tasks: [
          {
            type: "generate_narrative",
            input: prompt,
            output: JSON.stringify(data),
          },
        ],
      });

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
        const content = items[i].trim().replaceAll("---", "");
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
    const buffer = await fs.promises.readFile(filePath, { encoding: "utf-8" });
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

const defaultEntity: Entity = {
  id: "unknown",
  name: "Unknown Entity",
  description: "No description available",
  score: 0,
  relations: [],
  documents: [],
  state: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const gameLib = new GameLib();
