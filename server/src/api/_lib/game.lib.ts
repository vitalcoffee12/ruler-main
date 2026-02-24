import mongoose from "mongoose";
import {
  Entity,
  GameHistory,
  Rule,
  SceneHistory,
  Term,
} from "../game/gameModel";

import { COLLECTION_SUFFIX } from "../constants";
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
      | "chat"
      | "entities"
      | "rankedTerms"
      | "rankedEntities"
      | "tasks"
      | "citations"
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
    data: SceneHistory,
    gameHistory: GameHistory,
  ) {
    const guild = await this.guildRepository.findOne({
      where: { code: guildCode },
    });

    if (!guild) {
      throw new Error(`Guild with code ${guildCode} not found`);
    }

    try {
      const collection = mongoose.connection.collection(
        `${guildCode}.${COLLECTION_SUFFIX.SCENE_HISTORY}`,
      );
      await collection.insertOne({
        ...data,
        sceneId: guild?.sceneId,
        createdAt: new Date(),
      });
      const gameCollection = mongoose.connection.collection(
        `${guildCode}.${COLLECTION_SUFFIX.GAME_HISTORY}`,
      );
      await gameCollection.insertOne({
        ...gameHistory,
        sceneId: guild?.sceneId,
      });
    } catch (error) {
      console.error("Error inserting scene history:", error);
      throw error;
    }

    guild.sceneId += 1;
    await this.guildRepository.save(guild);
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

  async getRankedTerms(
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
}

export const gameLib = new GameLib();
