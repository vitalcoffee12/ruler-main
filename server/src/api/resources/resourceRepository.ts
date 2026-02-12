import {
  generateRandomCode,
  GenerateRuleSetCode,
  GenerateTermSetCode,
} from "../utils";
import { ResourceEntity } from "@/entities/resourceEntity";
import mongoose from "mongoose";
import { COLLECTION_SUFFIX } from "../constants";
import { mongoLib } from "../_lib/mongo.lib";
import { Rule } from "../game/gameModel";
import { In, Repository } from "typeorm";
import AppDataSource from "@/dataSource";

export class ResourceRepository extends Repository<ResourceEntity> {
  public async findAllByTypes(types: string[]): Promise<ResourceEntity[]> {
    const resources = await this.findBy({ type: In(types) });
    return resources;
  }

  public async createResource(resourceData: {
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
      return await this.save(newResource);
    }
    return await this.save(newResource);
  }

  public async addToFavorites(resourceId: number): Promise<void> {
    await this.createQueryBuilder()
      .update(ResourceEntity)
      .set({ favoriteCount: () => "favoriteCount + 1" })
      .where("id = :id", { id: resourceId })
      .execute();
  }

  public async downloadToGuild(
    resourceId: number,
    guildCode: string,
  ): Promise<void> {
    const resource = await this.findOne({
      where: { id: resourceId },
    });
    if (!resource) {
      throw new Error(`Resource with id ${resourceId} not found`);
    }
    const type = resource.type;

    if (type === "ruleSet") {
      await mongoose.connection
        .collection(`${guildCode}.${COLLECTION_SUFFIX.RULE_SET}`)
        .insertMany([]);
    }

    await this.createQueryBuilder()
      .update(ResourceEntity)
      .set({ downloadCount: () => "downloadCount + 1" })
      .where("id = :id", { id: resourceId })
      .execute();
  }
}

export const resourceRepository = new ResourceRepository(
  ResourceEntity,
  AppDataSource.manager,
);
