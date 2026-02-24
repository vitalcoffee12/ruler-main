import mongoose from "mongoose";

export class MongoLib {
  // 벡터 인덱스 생성, 옵션으로 임베딩 사이즈, 필드 설정 가능
  // 각 규칙, 용어집 콜렉션에서 문맥 검색을 위함
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

  // 고유 인덱스 생성, 옵션으로 필드 설정 가능
  // 규칙 및 용어집에서 id로 중복된 항목이 들어오는 것을 방지... object id는 사람이 읽기 어려우니
  // 별도의 인티저 id 필드를 추가하였음.
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

  async findAllDocuments<T>(collectionName: string): Promise<T[]> {
    const documents = await mongoose.connection
      .collection(collectionName)
      .find({})
      .toArray();
    return documents as T[];
  }

  async findDocumentByField<T>(
    collectionName: string,
    fieldName: string,
    value: any,
  ): Promise<T | null> {
    const document = await mongoose.connection
      .collection(collectionName)
      .findOne({ [fieldName]: value });
    return document as T | null;
  }

  async searchByEmbedding(
    collectionName: string,
    embedding: number[],
    topK: number = 5,
    options?: {
      fieldName?: string;
    },
  ): Promise<any[]> {
    const fieldName = options?.fieldName || "embedding";

    const results = await mongoose.connection
      .collection(collectionName)
      .aggregate([
        {
          $vectorSearch: {
            index: `${fieldName}_vector_index`,
            queryVector: embedding,
            path: fieldName,
            numCandidates: topK,
            limit: topK,
          },
        },
        {
          $addFields: {
            score: { $meta: "vectorSearchScore" },
          },
        },
      ])
      .toArray();
    return results;
  }

  async bulkWriteDocuments(
    collectionName: string,
    operations: mongoose.mongo.AnyBulkWriteOperation<any>[],
  ) {
    await mongoose.connection.collection(collectionName).bulkWrite(operations);
  }

  async insertDocumentsToEmptyCollection(
    collectionName: string,
    documents: any,
  ): Promise<void> {
    await mongoose.connection.collection(collectionName).deleteMany({});
    await mongoose.connection.collection(collectionName).insertMany(documents);
  }
}

export const mongoLib = new MongoLib();
