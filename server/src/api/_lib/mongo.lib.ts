import mongoose from "mongoose";
import { COLLECTION_SUFFIX } from "../constants";
import { Rule } from "../game/gameModel";

export class MongoLib {
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
            numDimensions: vectorSize,
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
}

export const mongoLib = new MongoLib();
