import fs from "fs";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { Resource } from "./resourceModel";
import { Rule, Term, TermSchema } from "../game/gameModel";
import path from "path";
import { AgentLib } from "../_lib/agent.lib";
import { mongoLib } from "../_lib/mongo.lib";
import { COLLECTION_SUFFIX } from "../constants";
import { ResourceEntity } from "@/entities/resourceEntity";
import mongoose from "mongoose";
import { generateRandomCode, getCodeWithoutPrefix } from "../utils";
import { GuildResourceEntity } from "@/entities/guildResourceEntity";

import { In, Repository } from "typeorm";
import { GuildEntity } from "@/entities/guildEntity";
import AppDataSource from "@/dataSource";

interface NestedRule {
  title: string;
  content: string[];
  level: number;
  children: NestedRule[];
}

export class ResourceService {
  constructor(
    private agentLib: AgentLib = new AgentLib(),
    private guildRepository: Repository<GuildEntity> = AppDataSource.getRepository(
      GuildEntity,
    ),
    private guildResourceRepository: Repository<GuildResourceEntity> = AppDataSource.getRepository(
      GuildResourceEntity,
    ),
    private resourceRepository: Repository<ResourceEntity> = AppDataSource.getRepository(
      ResourceEntity,
    ),
  ) {}

  // Retrieves all resources from the database
  async findAll(): Promise<ServiceResponse<Resource[] | null>> {
    try {
      const resources = await this.resourceRepository.find();
      if (!resources || resources.length === 0) {
        return ServiceResponse.failure(
          "No Resources found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<Resource[]>("Resources found", resources);
    } catch (ex) {
      const errorMessage = `Error finding all resources: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving resources.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Retrieves a single resource by their ID
  async findById(id: number): Promise<ServiceResponse<Resource | null>> {
    try {
      const resource = await this.resourceRepository.findOne({
        where: { id },
      });
      if (!resource) {
        return ServiceResponse.failure(
          "Resource not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<Resource>("Resource found", resource);
    } catch (ex) {
      const errorMessage = `Error finding resource with id ${id}:, ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while finding resource.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByGuildCode(
    type: "ruleSet" | "termSet",
    code: string,
    page: number,
  ): Promise<ServiceResponse<{ data: Resource[]; maxPage: number } | null>> {
    try {
      console.log(type, code, page);
      const collection = await mongoose.connection.collection(
        `${code}.${
          type === "ruleSet"
            ? COLLECTION_SUFFIX.RULE_SET
            : COLLECTION_SUFFIX.TERM_SET
        }`,
      );
      const resources = await collection
        .find<any>({})
        .skip((page - 1) * 10)
        .limit(10)
        .toArray();
      const counts = await collection.countDocuments();
      const maxPage = Math.ceil(counts / 10);

      if (!resources || resources.length === 0) {
        return ServiceResponse.failure(
          "No Resources found for the guild",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<{ data: Resource[]; maxPage: number }>(
        "Resources found",
        { data: resources, maxPage },
      );
    } catch (ex) {
      const errorMessage = `Error finding resources for guild code ${code}:, ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving resources for the guild.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async importResourceToGuilds(
    id: string,
    guildCodes: string[],
  ): Promise<ServiceResponse<boolean>> {
    console.log(id, guildCodes);
    try {
      const resource = await this.resourceRepository.findOne({
        where: { id: Number(id) },
      });

      const guilds = await this.guildRepository.find({
        where: { code: In(guildCodes) },
      });
      if (!resource || !guilds || guilds.length === 0) {
        return ServiceResponse.failure(
          "Guild or Resource not found",
          false,
          StatusCodes.NOT_FOUND,
        );
      }
      const resourceCollection = await mongoose.connection.collection(
        `${resource.code}.${
          resource.type === "ruleSet"
            ? COLLECTION_SUFFIX.RULE_SET
            : COLLECTION_SUFFIX.TERM_SET
        }`,
      );
      const docs = await resourceCollection.find<any>({}).toArray();

      const insertGuildResources: GuildResourceEntity[] = [];
      for (const guild of guilds) {
        const guildResources = await this.guildResourceRepository.find({
          where: { guildCode: guild.code, resourceId: Number(id) },
        });
        if (!guildResources || guildResources.length === 0) {
          const ngr = new GuildResourceEntity({
            guildId: guild.id,
            guildCode: guild.code,
            resourceId: resource.id,
            resourceCode: resource.code,
            type: resource.type,
          });
          insertGuildResources.push(ngr);
        }

        if (resource.type === "ruleSet") {
          const guildCollection = await mongoose.connection.collection(
            `${guild.code}.${COLLECTION_SUFFIX.RULE_SET}`,
          );
          let lastId = await guildCollection.countDocuments();

          for (let j = 0; j < docs.length; j++) {
            docs[j].id = lastId + j;
            if (docs[j].children && Array.isArray(docs[j].children)) {
              docs[j].children = docs[j].children.map(
                (n: number) => lastId + n,
              );
            }
          }
          await guildCollection.insertMany(docs);

          lastId += docs.length;
        } else if (resource.type === "termSet") {
          const guildCollection = await mongoose.connection.collection(
            `${guild.code}.${COLLECTION_SUFFIX.TERM_SET}`,
          );
          let lastId = await guildCollection.countDocuments();

          for (let j = 0; j < docs.length; j++) {
            docs[j].id = lastId + j;
          }
          await guildCollection.insertMany(docs);
          lastId += docs.length;
        }
      }

      await this.guildResourceRepository.save(insertGuildResources);
    } catch (ex) {
      const errorMessage = `Error importing resource ${id}:, ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while importing resources to the guild.",
        false,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
    return ServiceResponse.success<boolean>(
      "Resources imported to guild successfully",
      true,
      StatusCodes.OK,
    );
  }

  public async createResourceCollection(
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
        imagePath: `https://picsum.photos/${Math.random() * 1000 + 300}`,
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

      await this.resourceRepository.save(ruleSet);
    }
    if (options?.termSetData) {
      const termSet: Partial<ResourceEntity> = {
        code: `T-${code}`,
        ownerId: writer.userId,
        ownerCode: writer.userCode,
        name: options.termSetData.name,
        description: options.termSetData.description || "",
        type: "termSet",
        imagePath: `https://picsum.photos/${Math.random() * 1000 + 300}`,
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
      await this.resourceRepository.save(termSet);
    }
  }

  async upload(
    writer: { userId: number; userCode: string },
    resourceData: {
      name: string;
      description?: string;
      filePath?: string;
    },
  ): Promise<ServiceResponse<string | null>> {
    try {
      const rules = await buildRuleFromMarkdown(resourceData.filePath);

      let code = generateRandomCode();
      while (true) {
        const existing = await this.resourceRepository.findOne({
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

      await this.createResourceCollection(
        code,
        { userId: writer.userId, userCode: writer.userCode },
        {
          ruleSetData: {
            name: resourceData.name,
            description: resourceData.description,
            fileName: resourceData.filePath,
          },
        },
      );

      await mongoose.connection
        .collection(`R-${code}.${COLLECTION_SUFFIX.RULE_SET}`)
        .insertMany(rules);

      return ServiceResponse.success<string>(
        "Resource created successfully",
        code,
        StatusCodes.CREATED,
      );
    } catch (ex) {
      const errorMessage = `Error creating resource: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while creating resource.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async format(id: number): Promise<boolean> {
    try {
      // 사용자에게 선 응답으로 처리 요청이 들어간 것만 전달.
      // 처리 프로세스는 서버에서 진행하고, 캐시 등에 진행상황만 저장.
      // 사용자는 별도 API로 진행상황을 조회. 조회 중인 클라이언트에 실시간 프로세싱 상태를 소켓으로 전달 여부는 추후 고민...

      const resource = await this.resourceRepository.findOne({
        where: { id },
      });

      if (!resource) {
        return false;
      }
      const type = resource.type || "ruleSet";

      // rule set processing
      if (type === "ruleSet") {
        const documents = await mongoLib.findAllDocuments<Rule>(
          `${resource.code}.${COLLECTION_SUFFIX.RULE_SET}`,
        );
        const result = await this.agentLib.formatRuleSet(documents);
        if (!result) {
          return false;
        }

        // rule set summary embedding
        for (let i = 0; i < result.length; i++) {
          if (!result[i].summary) continue;
          const embedded = await this.agentLib.embedText(
            result[i].summary || "",
          );
          result[i].embedding = embedded ? embedded : undefined;
        }

        // update
        await mongoLib.bulkWriteDocuments(
          `${resource.code}.${COLLECTION_SUFFIX.RULE_SET}`,
          result.map((item) => ({
            updateOne: {
              filter: { id: item.id },
              update: {
                $set: {
                  keywords: item.keywords,
                  summary: item.summary,
                  embedding: item.embedding,
                  updatedAt: item.updatedAt,
                },
              },
            },
          })),
        );

        // check term set existence & term processing
        let termResource = await this.resourceRepository.findOne({
          where: { code: `T-${getCodeWithoutPrefix(resource?.code || "")}` },
        });
        if (!termResource) {
          termResource = new ResourceEntity({
            code: `T-${getCodeWithoutPrefix(resource?.code || "")}`,
            ownerId: resource?.ownerId || 0,
            ownerCode: resource?.ownerCode || "",
            name: `${resource?.name || ""} - Term Set`,
            description: `Auto generated term set for ${resource?.name || ""}`,
            type: "termSet",
            imagePath: `https://picsum.photos/${Math.random() * 1000 + 300}`,
            ...resourceDefaultData,
          });
        }
        await this.resourceRepository.save(termResource);

        // term set 생성
        const keywords = result.flatMap((rule) => rule.keywords || []) as {
          term: string;
          description: string;
          embedding?: number[] | null;
          updatedAt?: Date;
          createdAt?: Date;
        }[];

        for (let i = 0; i < keywords.length; i++) {
          const embedded = await this.agentLib.embedText(
            keywords[i].description,
          );
          keywords[i].embedding = embedded;
          keywords[i].updatedAt = new Date();
          keywords[i].createdAt = keywords[i].createdAt || new Date();
        }

        await mongoLib.insertDocumentsToEmptyCollection(
          `T-${getCodeWithoutPrefix(resource.code)}.${COLLECTION_SUFFIX.TERM_SET}`,
          keywords.map((keyword, index) => ({
            id: index + 1,
            version: 1,
            term: keyword.term,
            description: keyword.description,
            embedding: keyword.embedding,
            updatedAt: keyword.updatedAt,
            createdAt: keyword.createdAt || new Date(),
          })),
        );

        await this.resourceRepository.save(resource);
      }

      // term processing
      if (type === "termSet") {
        const documents = await mongoLib.findAllDocuments<Term>(
          `${resource.code}.${COLLECTION_SUFFIX.TERM_SET}`,
        );

        for (let i = 0; i < documents.length; i++) {
          const embedded = await this.agentLib.embedText(
            documents[i].description,
          );
          documents[i].embedding = embedded ? embedded : undefined;
          documents[i].updatedAt = new Date();
        }

        await mongoLib.bulkWriteDocuments(
          `${resource.code}.${COLLECTION_SUFFIX.TERM_SET}`,
          documents.map((item) => ({
            updateOne: {
              filter: { id: item.id },
              update: {
                $set: {
                  embedding: item.embedding,
                  updatedAt: item.updatedAt,
                },
              },
            },
          })),
        );
      }

      return true;
    } catch (ex) {
      const errorMessage = `Error formatting resource with id ${id}:, ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return false;
    }
  }

  // ---------------------
  // async buildRuleSetDB(
  //   filename: string,
  //   options?: {
  //     ruleSetName?: string;
  //     description?: string;
  //     embeddingSize?: number;
  //   },
  // ) {
  //   const ruleSetCode = GenerateRuleSetCode();
  //   await this.gameRepository.createRuleSet(ruleSetCode, {
  //     name: options?.ruleSetName || "Default Rule Set",
  //     description: options?.description || `Imported from ${filename}`,
  //   });

  //   const rules = await this.buildRuleFromMarkdown(filename);
  //   await this.gameRepository.insertRuleToRuleSet(ruleSetCode, rules);

  //   return ruleSetCode;
  //}
}
export const resourceService = new ResourceService();

// rule operations

function splitRules(
  title: string,
  markdown: string,
  level: number,
): NestedRule {
  const result: NestedRule = {
    title: title,
    content: [],
    level,
    children: [],
  };

  if (level > 6) {
    result.content = [markdown.trim()];
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
      const contents = items[i].trim().split("\n");
      let paragraphs = "";
      for (const line of contents) {
        paragraphs += line.trim() + "\n";
        if (paragraphs.trim().length > 200) {
          result.content.push(paragraphs.trim());
          paragraphs = "";
        }
      }
      if (paragraphs.trim().length > 0) result.content.push(paragraphs.trim());
      continue;
    }

    const subtitle = items[i].split("\n")[0].trim();
    const content = items[i].substring(subtitle.length).trim();

    const child = splitRules(subtitle, content, level + 1);
    // process each item
    children.push(child);
  }
  result.children = children;
  return result;
}

// flat nested rule and give unique id for each item (3)
function nestedRuleToRule(
  startId: number,
  categories: string[],
  nestedRule: NestedRule,
): { rules: Rule[]; endId: number } {
  const rules = [];
  const subCategories = [...categories, nestedRule.title];
  const rule: Rule = {
    id: startId,
    version: 1,
    title: nestedRule.title,
    content: nestedRule.content,
    keywords: [],
    categories: subCategories,
    children: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const childrenRules = [];
  let currentId = startId + 1;
  for (let i = 0; i < nestedRule.children.length; i++) {
    rule.children.push(currentId);
    const child = nestedRule.children[i];
    const childRules = nestedRuleToRule(currentId, subCategories, child);
    childrenRules.push(...childRules.rules);
    currentId = childRules.endId;
  }

  rules.push(rule);
  rules.push(...childrenRules);

  return { rules, endId: currentId };
}

// given markdown file, build rules (2)
async function buildRuleFromMarkdown(
  filename: string = "Blades-in-the-Dark-SRD.md",
): Promise<Rule[]> {
  const filePath = path.join(__dirname, "..", "..", "..", "uploads", filename);
  let rules: Rule[] = [];
  const buffer = await fs.promises.readFile(filePath, { encoding: "utf-8" });
  const nestedRule = splitRules("Blades in the Dark", buffer, 0);
  rules = nestedRuleToRule(1, [], nestedRule).rules;

  return rules;
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
