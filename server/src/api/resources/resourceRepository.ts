import { OAUTH_PROVIDERS } from "@/common/constants";
import AppDataSource from "@/dataSource.js";
import { UserEntity } from "@/entities/userEntity";
import {
  generateRandomCode,
  GenerateRuleSetCode,
  GenerateTermSetCode,
  GenerateUserCode,
} from "../utils";
import { ResourceEntity } from "@/entities/ruleSetEntity";
import { GuildEntity } from "@/entities/guildEntity";
import mongoose from "mongoose";
import { COLLECTION_SUFFIX } from "../constants";
import { GameRepository } from "../game/gameRepository";
import { mongoLib } from "../_lib/mongo.lib";
import { Or } from "typeorm";
import path from "path";
import { Rule } from "../game/gameModel";

export class ResourceRepository {
  private entityManager;
  constructor() {
    this.entityManager = AppDataSource.manager;
  }

  async findAll(): Promise<ResourceEntity[]> {
    const resources = await this.entityManager.find(ResourceEntity);
    return resources;
  }

  async findById(id: number): Promise<ResourceEntity | null> {
    const resource = await this.entityManager.findOne(ResourceEntity, {
      where: { id },
    });
    return resource || null;
  }

  async findAllByTypes(types: string[]): Promise<ResourceEntity[]> {
    const resources = await this.entityManager
      .createQueryBuilder(ResourceEntity, "resource")
      .where("resource.type IN (:...types)", { types })
      .getMany();
    return resources;
  }

  async createResourceCollection(
    code: string,
    writer: {
      userId: number;
      userCode: string;
    },
    options?: {
      ruleSetData?: {
        name: string;
        description?: string;
        fileName?: string;
      };
      termSetData?: {
        name: string;
        description?: string;
        fileName?: string;
      };
    },
  ): Promise<void> {
    if (options?.ruleSetData) {
      const ruleSet: Partial<ResourceEntity> = {
        code: `R-${code}`,
        ownerId: writer.userId,
        ownerCode: writer.userCode,
        name: options.ruleSetData.name,
        description: options.ruleSetData.description || "",
        type: "ruleSet",
        imagePath: "https://picsum.photos/422",
        filePath: options.ruleSetData.fileName || undefined,
        ...resourceDefaultData,
      };

      await mongoose.connection.createCollection(
        `${ruleSet.code}.${COLLECTION_SUFFIX.RULE_SET}`,
      );
      await mongoLib.createEmbeddingIndex(
        `${ruleSet.code}.${COLLECTION_SUFFIX.RULE_SET}`,
        {
          embeddingSize: 4096,
          fieldName: "embedding",
        },
      );
      await mongoLib.createUniqueIndex(
        `${ruleSet.code}.${COLLECTION_SUFFIX.RULE_SET}`,
        { fieldName: "id" },
      );

      await this.entityManager.save(ResourceEntity, ruleSet);
    }
    if (options?.termSetData) {
      const termSet: Partial<ResourceEntity> = {
        code: `T-${code}`,
        ownerId: writer.userId,
        ownerCode: writer.userCode,
        name: options.termSetData.name,
        description: options.termSetData.description || "",
        type: "termSet",
        imagePath: "https://picsum.photos/420",
        filePath: options.termSetData.fileName || undefined,
        ...resourceDefaultData,
      };

      await mongoose.connection.createCollection(
        `${termSet.code}.${COLLECTION_SUFFIX.TERM_SET}`,
      );
      await mongoLib.createEmbeddingIndex(
        `${termSet.code}.${COLLECTION_SUFFIX.TERM_SET}`,
        {
          embeddingSize: 4096,
          fieldName: "embedding",
        },
      );
      await mongoLib.createUniqueIndex(
        `${termSet.code}.${COLLECTION_SUFFIX.TERM_SET}`,
        { fieldName: "id" },
      );
      await this.entityManager.save(ResourceEntity, termSet);
    }
  }

  async uploadFile(
    writer: { userId: number; userCode: string },
    resourceData: {
      name: string;
      description?: string;
      filePath?: string;
    },
    data: Rule[],
  ): Promise<string> {
    let code = generateRandomCode();
    while (true) {
      const existing = await this.entityManager.findOne(ResourceEntity, {
        where: [
          {
            code: `R-${code}`,
          },
          {
            code: `T-${code}`,
          },
        ],
      });
      if (!existing) {
        break;
      }
      code = generateRandomCode();
    }

    await this.createResourceCollection(code, writer, {
      ruleSetData: {
        name: resourceData.name,
        description: resourceData.description,
        fileName: resourceData.filePath,
      },
      termSetData: {
        name: resourceData.name,
        description: resourceData.description,
        fileName: resourceData.filePath,
      },
    });

    await mongoose.connection
      .collection(`R-${code}.${COLLECTION_SUFFIX.RULE_SET}`)
      .insertMany(data);

    return code;
  }

  async create(resourceData: {
    name: string;
    description?: string;
    type: "ruleSet" | "termSet";
    userId: number;
    userCode: string;
    filePath?: string;
  }): Promise<ResourceEntity> {
    const code =
      resourceData.type === "ruleSet"
        ? GenerateRuleSetCode()
        : GenerateTermSetCode();
    const newResource: Partial<ResourceEntity> = {
      code: code,
      ...resourceData,
      type: resourceData.type,
      createdAt: new Date(),
      updatedAt: new Date(),
      filePath: resourceData.filePath || undefined,
    };

    if (resourceData.type === "ruleSet") {
      const ruleSetCode = code;

      await mongoose.connection.createCollection(
        `${ruleSetCode}.${COLLECTION_SUFFIX.RULE_SET}`,
      );
      await mongoLib.createEmbeddingIndex(
        `${ruleSetCode}.${COLLECTION_SUFFIX.RULE_SET}`,
        {
          embeddingSize: 4096,
          fieldName: "embedding",
        },
      );
      await mongoLib.createUniqueIndex(
        `${ruleSetCode}.${COLLECTION_SUFFIX.RULE_SET}`,
        { fieldName: "id" },
      );

      await mongoose.connection.createCollection(
        `${ruleSetCode}.${COLLECTION_SUFFIX.TERM_SET}`,
      );
      await mongoLib.createEmbeddingIndex(
        `${ruleSetCode}.${COLLECTION_SUFFIX.TERM_SET}`,
        {
          embeddingSize: 4096,
          fieldName: "embedding",
        },
      );
      await mongoLib.createUniqueIndex(
        `${ruleSetCode}.${COLLECTION_SUFFIX.TERM_SET}`,
        { fieldName: "id" },
      );
      return await this.entityManager.save(ResourceEntity, newResource);
    }
    return await this.entityManager.save(ResourceEntity, newResource);
  }

  async addToFavorites(resourceId: number): Promise<void> {
    await this.entityManager
      .createQueryBuilder()
      .update(ResourceEntity)
      .set({ favoriteCount: () => "favoriteCount + 1" })
      .where("id = :id", { id: resourceId })
      .execute();
  }

  async downloadToGuild(resourceId: number, guildCode: string): Promise<void> {
    const resource = await this.findById(resourceId);
    if (!resource) {
      throw new Error(`Resource with id ${resourceId} not found`);
    }
    const type = resource.type;

    if (type === "ruleSet") {
      await mongoose.connection
        .collection(`${guildCode}.${COLLECTION_SUFFIX.RULE_SET}`)
        .insertMany([]);
    }

    await this.entityManager
      .createQueryBuilder()
      .update(ResourceEntity)
      .set({ downloadCount: () => "downloadCount + 1" })
      .where("id = :id", { id: resourceId })
      .execute();
  }
}

const resourceDefaultData = {
  distributors: [],
  tags: [],
  visibility: "private" as "public" | "private" | "unlisted",
  downloadCount: 0,
  favoriteCount: 0,
  rating: 0,
  reviews: 0,
  version: 1,
};
