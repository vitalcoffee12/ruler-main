import mongoose from "mongoose";
import {
  Entity,
  GameHistory,
  Rule,
  SceneHistory,
  Term,
} from "../game/gameModel";

import { COLLECTION_SUFFIX, PREDEFINED_USER } from "../constants";
import { Repository } from "typeorm";
import { GuildEntity } from "@/entities/guildEntity";
import AppDataSource from "@/dataSource";
import { mongoLib } from "./mongo.lib";
import { agentLib } from "./agent.lib";

export class GameLib {
  constructor(
    private guildRepository: Repository<GuildEntity> = AppDataSource.getRepository(
      GuildEntity,
    ),
  ) {}

  // game world operations
  async getWorld(
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
      .collection(`${guildCode}.${COLLECTION_SUFFIX.GAME_HISTORY}`)
      .find<GameHistory>({})
      .toArray();
    return {
      sceneHistories,
      gameHistories,
      world: this.restoreWorld(gameHistories),
    };
  }

  restoreWorld(gameHistories: GameHistory[]): Entity[] {
    const entities = new Map<string, Entity>();

    for (const history of gameHistories) {
      for (const entity of history.entities) {
        const key = `${entity.id}`;
        if (!entities.has(key)) {
          entities.set(key, { ...entity, score: entity.score ?? 0 });
        } else {
          const existing = entities.get(key)!;
          existing.score = (existing.score ?? 0) + (entity.score ?? 0);
          existing.description = entity.description;
        }
      }
    }
    return Array.from(entities.values())
      .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
      .filter((e) => e.state !== "removed");
  }

  // insert single game history document into the guild-specific collection
  async insertGameHistory(
    guildCode: string,
    data: Pick<
      GameHistory,
      "chat" | "entities" | "tasks" | "documents" | "terms"
    >,
  ) {
    const guild = await this.guildRepository.findOne({
      where: { code: guildCode },
      select: { sceneId: true },
    });

    if (!guild) {
      throw new Error(`Guild with code ${guildCode} not found`);
    }

    const collection = mongoose.connection.collection(
      `${guildCode}.${COLLECTION_SUFFIX.GAME_HISTORY}`,
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
        `${guildCode}.${COLLECTION_SUFFIX.SCENE_HISTORY}`,
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
      `${guildCode}.${COLLECTION_SUFFIX.GAME_HISTORY}`,
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
      `${guildCode}.${COLLECTION_SUFFIX.SCENE_HISTORY}`,
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
      `${guildCode}.${COLLECTION_SUFFIX.SCENE_HISTORY}`,
    );
    const doc = await collection.findOne<SceneHistory>({ sceneId });
    return doc as SceneHistory | null;
  }

  async importRuleSetToGuildRuleSet(
    guildCode: string,
    code: string,
  ): Promise<number> {
    const ruleSet = await mongoose.connection
      .collection(`${code}.${COLLECTION_SUFFIX.RULE_SET}`)
      .find<Rule>({})
      .toArray();
    await mongoose.connection
      .collection(`${guildCode}.${COLLECTION_SUFFIX.RULE_SET}`)
      .insertMany(ruleSet);

    return await mongoose.connection
      .collection(`${guildCode}.${COLLECTION_SUFFIX.RULE_SET}`)
      .countDocuments();
  }

  async findRulesFromRuleSet(
    code: string,
    searchKeywords: string[],
    limit: number = 10,
  ) {
    const exactMatch = await mongoose.connection
      .collection(`${code}.${COLLECTION_SUFFIX.RULE_SET}`)
      .find<Rule>({
        title: { $in: searchKeywords },
      })
      .toArray();

    const keywordMatch = await mongoose.connection
      .collection(`${code}.${COLLECTION_SUFFIX.RULE_SET}`)
      .find<Rule>({ keywords: { $in: searchKeywords } })
      .toArray();

    if (exactMatch.length + keywordMatch.length >= limit) {
      return [...exactMatch, ...keywordMatch];
    }

    return [...exactMatch, ...keywordMatch];
    // fill the rest with context matches
    // TODO: improve relevance scoring
    const contextMatch = await mongoose.connection
      .collection(`${code}.${COLLECTION_SUFFIX.RULE_SET}`)
      .find<Rule>({ content: { $in: searchKeywords } })
      .toArray();
    if (exactMatch.length > 0) {
      return exactMatch;
    }
  }

  // term set operations
  async insertTermToTermSet(code: string, terms: Term[]) {
    const termSet = await mongoose.connection
      .collection(`${code}.${COLLECTION_SUFFIX.TERM_SET}`)
      .insertMany(terms);
    return termSet;
  }

  async importTermSetToGuildTermSet(
    guildCode: string,
    code: string,
  ): Promise<number> {
    const termSet = await mongoose.connection
      .collection(`${code}.${COLLECTION_SUFFIX.TERM_SET}`)
      .find<Term>({})
      .toArray();
    await mongoose.connection
      .collection(`${guildCode}.${COLLECTION_SUFFIX.TERM_SET}`)
      .insertMany(termSet);
    return await mongoose.connection
      .collection(`${guildCode}.${COLLECTION_SUFFIX.TERM_SET}`)
      .countDocuments();
  }

  async findTermsFromTermSet(
    guildCode: string,
    searchKeywords: string[],
    limit: number = 10,
  ) {
    const exactMatch = await mongoose.connection
      .collection(`${guildCode}.${COLLECTION_SUFFIX.TERM_SET}`)
      .find<Term>({
        term: { $in: searchKeywords },
      })
      .toArray();

    return [...exactMatch];
    // fill the rest with context matches
    // TODO: improve relevance scoring
    const contextMatch = await mongoose.connection
      .collection(`${guildCode}.${COLLECTION_SUFFIX.TERM_SET}`)
      .find<Term>({ definition: { $in: searchKeywords } })
      .toArray();
    if (exactMatch.length > 0) {
      return exactMatch;
    }
  }

  async searchRankedTerms(guildCode: string): Promise<Term[]> {
    const termSet = await mongoose.connection
      .collection(`${guildCode}.${COLLECTION_SUFFIX.TERM_SET}`)
      .find<Term>({})
      .sort({ score: 1 })
      .limit(10)
      .toArray();

    return termSet;
  }

  async searchContextualTerms(
    guildCode: string,
    queryString: string,
  ): Promise<Term[]> {
    const embedding = await agentLib.embedText(queryString);
    if (!embedding) {
      return [];
    }

    const termSet = await mongoLib.searchByEmbedding(
      `${guildCode}.${COLLECTION_SUFFIX.TERM_SET}`,
      embedding,
    );

    return termSet.sort((a, b) => (b.version ?? 0) - (a.version ?? 0));
  }

  async requestNarrative(guildCode: string): Promise<boolean | null> {
    try {
      const guild = await this.guildRepository.findOne({
        where: { code: guildCode },
      });
      if (!guild) {
        return null;
      }
      const responseUser = PREDEFINED_USER.GUILD(guildCode, guild.name);
      const terms = await this.searchRankedTerms(guildCode);
      const history = await this.getWorld(guildCode, guild.sceneId - 1);
      const world = history.world;
      const chatHistories = history.gameHistories
        .filter(
          (gh) =>
            gh.chat && gh.chat.message && gh.chat.userId !== responseUser.id,
        )
        .map((ch) => `[${ch?.chat?.userCode}] ${ch?.chat?.message}`);
      const sceneHistories = history.sceneHistories;
      let prevScene = "";
      if (sceneHistories.length > 0) {
        const latestScene = sceneHistories[sceneHistories.length - 1];
        prevScene = latestScene.sceneDescription;
      }

      const entities = world
        .slice(0, 5)
        .map(
          (entity) => `[${entity.id}] ${entity.name}: ${entity.description}`,
        );

      const { data, prompt } = await agentLib.generateNarrative({
        chatHistories: chatHistories.join("\n") || "No chat history",
        prevScene: prevScene || "No previous scene",
        documents: "",
        terms: terms
          .map((t) => `[${t.id}] ${t.term}: ${t.description}`)
          .join("\n"),
        entities: entities.join("\n"),
      });

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
        documents: data.documents?.map((d) => ({
          id: d.id,
          comment: d.comment,
        })),
        terms: data.terms?.map((t) => ({
          id: t.id,
          comment: t.comment,
        })),
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
        documents: data.documents?.map((d) => ({
          id: d.id,
          comment: d.comment,
        })),
        terms: data.terms?.map((t) => ({
          id: t.id,
          comment: t.comment,
        })),
        entities: world,
        createdAt: new Date(),
      });
      guild.sceneId += 1;
      await this.guildRepository.save(guild);

      return true;
    } catch (ex) {
      console.error("Error in requestNarrative:", ex);
      return null;
    }
  }

  async requestEdit(guildCode: string): Promise<boolean | null> {
    try {
      const guild = await this.guildRepository.findOne({
        where: { code: guildCode },
      });
      if (!guild) {
        return null;
      }

      const responseUser = PREDEFINED_USER.SYSTEM;
      const terms = await this.searchRankedTerms(guildCode);
      const history = await this.getWorld(guildCode, guild.sceneId - 1);
      const world = history.world;
      const sceneHistories = history.sceneHistories;

      const entities = world
        .slice(0, 5)
        .map(
          (entity) => `[${entity.id}] ${entity.name}: ${entity.description}`,
        );

      const { data, prompt } = await agentLib.generateEdits({
        narrative:
          sceneHistories.length > 0
            ? sceneHistories[sceneHistories.length - 1].message
            : "No previous narrative",
        sceneDescription:
          sceneHistories.length > 0
            ? sceneHistories[sceneHistories.length - 1].sceneDescription
            : "No previous scene",
        documents: "",
        terms: terms
          .map((t) => `[${t.id}] ${t.term}: ${t.description}`)
          .join("\n"),
        entities: entities.join("\n"),
      });

      await this.insertGameHistory(guildCode, {
        chat: {
          userId: responseUser.id,
          userCode: responseUser.code,
          message: `[System] The game world has been edited. updates: ${data.created.length} created, ${data.updated.length} updated, ${data.deleted.length} deleted. Check the latest scene for details.`,
        },
        entities: [
          ...data.created,
          ...data.updated,
          ...data.deleted.map((id) => ({
            ...defaultEntity,
            id,
            state: "removed",
          })),
        ],
        tasks: [
          {
            type: "generate_narrative",
            input: prompt,
            output: JSON.stringify({
              created: data.created,
              updated: data.updated,
              deleted: data.deleted,
            }),
          },
        ],
        documents: [],
        terms: [],
      });

      return true;
    } catch (ex) {
      console.error("Error in requestEdit:", ex);
      return null;
    }
  }
}

const defaultEntity: Entity = {
  id: "unknown",
  name: "Unknown Entity",
  description: "No description available",
  score: 0,
  documents: [],
  terms: [],
  state: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const gameLib = new GameLib();
