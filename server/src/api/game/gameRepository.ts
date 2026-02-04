import mongoose from "mongoose";
import {
  Entity,
  GameHistory,
  Rule,
  RuleSet,
  SceneHistory,
  Term,
} from "./gameModel";
import AppDataSource from "@/dataSource";
import { GuildEntity } from "@/entities/guildEntity";
import { RuleSetEntity } from "@/entities/ruleSetEntity";
import { COLLECTION_SUFFIX } from "../constants";

export class GameRepository {
  constructor(private entityManager = AppDataSource.manager) {}

  // game world operations
  async getWorld(
    guildCode: string,
    sceneId: number,
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
        const key = `${entity.name}`;
        if (!entities.has(key)) {
          entities.set(key, { ...entity, scoreDiff: entity.scoreDiff ?? 0 });
        } else {
          const existing = entities.get(key)!;
          existing.scoreDiff =
            (existing.scoreDiff ?? 0) + (entity.scoreDiff ?? 0);
          existing.description = entity.description;
        }
      }
    }
    return Array.from(entities.values()).sort(
      (a, b) => (a.scoreDiff ?? 0) - (b.scoreDiff ?? 0),
    );
  }

  // insert single game history document into the guild-specific collection
  async insertGameHistory(
    guildCode: string,
    data: Pick<GameHistory, "chat" | "entities">,
  ) {
    const guild = await this.entityManager.findOne(GuildEntity, {
      where: { code: guildCode },
      select: { sceneId: true },
    });

    if (!guild) {
      throw new Error(`Guild with code ${guildCode} not found`);
    }

    const collection = mongoose.connection.collection(
      `${guildCode}.${COLLECTION_SUFFIX.GAME_HISTORY}`,
    );
    await collection.insertOne({ ...data, sceneId: guild?.sceneId });
  }

  // insert single scene history document into the guild-specific collection and update guild's sceneId, game history
  async insertSceneHistory(
    guildCode: string,
    data: SceneHistory,
    gameHistory: GameHistory,
  ) {
    const guild = await this.entityManager.findOne(GuildEntity, {
      where: { code: guildCode },
      select: { sceneId: true },
    });

    if (!guild) {
      throw new Error(`Guild with code ${guildCode} not found`);
    }

    try {
      const collection = mongoose.connection.collection(
        `${guildCode}.${COLLECTION_SUFFIX.SCENE_HISTORY}`,
      );
      await collection.insertOne({ ...data, sceneId: guild?.sceneId });
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
    await this.entityManager.save(guild);
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
    count: number = 5,
  ): Promise<SceneHistory[]> {
    const collection = mongoose.connection.collection(
      `${guildCode}.${COLLECTION_SUFFIX.SCENE_HISTORY}`,
    );
    const doc = await collection
      .find<SceneHistory>({})
      .sort({ createdAt: -1 })
      .limit(count)
      .toArray();
    return doc as SceneHistory[];
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

  // rule set operations
  async createRuleSet(
    ruleSetCode: string,
    options: {
      name?: string;
      description?: string;
    },
  ): Promise<RuleSet> {
    const ruleSet: RuleSet = {
      code: ruleSetCode,
      name: options.name || "Default Rule Set",
      description: options.description || "",
    };

    await this.entityManager.getRepository(RuleSetEntity).insert(ruleSet);

    await mongoose.connection.createCollection(
      `${ruleSetCode}.${COLLECTION_SUFFIX.RULE_SET}`,
    );
    await this.createEmbeddingIndex(
      `${ruleSetCode}.${COLLECTION_SUFFIX.RULE_SET}`,
      {
        embeddingSize: 4096,
        fieldName: "embedding",
      },
    );
    await this.createUniqueIndex(
      `${ruleSetCode}.${COLLECTION_SUFFIX.RULE_SET}`,
      { fieldName: "id" },
    );

    await mongoose.connection.createCollection(
      `${ruleSetCode}.${COLLECTION_SUFFIX.TERM_SET}`,
    );
    await this.createEmbeddingIndex(
      `${ruleSetCode}.${COLLECTION_SUFFIX.TERM_SET}`,
      {
        embeddingSize: 4096,
        fieldName: "embedding",
      },
    );
    await this.createUniqueIndex(
      `${ruleSetCode}.${COLLECTION_SUFFIX.TERM_SET}`,
      { fieldName: "id" },
    );
    return ruleSet;
  }

  async createEmbeddingIndex(
    collectionName: string,
    options?: {
      embeddingSize?: number;
      fieldName?: string;
    },
  ) {
    const vectorSize = options?.embeddingSize || 4096;
    const fieldName = options?.fieldName || "embedding";

    await mongoose.connection.collection(collectionName).createSearchIndex({
      name: `${fieldName}_vector_index`,
      type: "vectorSearch",
      definition: {
        fields: [
          {
            type: "vector",
            path: fieldName,
            dimensions: vectorSize,
            similarity: "cosine",
          },
        ],
      },
    });
  }

  async createUniqueIndex(
    collectionName: string,
    options?: {
      fieldName?: string;
    },
  ) {
    const fieldName = options?.fieldName || "id";

    await mongoose.connection
      .collection(collectionName)
      .createIndex({ [fieldName]: 1 }, { unique: true });
  }
  async insertRuleToRuleSet(code: string, rules: Rule[]) {
    const ruleSet = await mongoose.connection
      .collection(`${code}.${COLLECTION_SUFFIX.RULE_SET}`)
      .insertMany(rules);
    return ruleSet;
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
    code: string,
    searchKeywords: string[],
    limit: number = 10,
  ) {
    const exactMatch = await mongoose.connection
      .collection(`${code}.${COLLECTION_SUFFIX.TERM_SET}`)
      .find<Term>({
        term: { $in: searchKeywords },
      })
      .toArray();

    return [...exactMatch];
    // fill the rest with context matches
    // TODO: improve relevance scoring
    const contextMatch = await mongoose.connection
      .collection(`${code}.${COLLECTION_SUFFIX.TERM_SET}`)
      .find<Term>({ definition: { $in: searchKeywords } })
      .toArray();
    if (exactMatch.length > 0) {
      return exactMatch;
    }
  }
}
