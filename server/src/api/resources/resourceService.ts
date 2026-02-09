import fs from "fs";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { ResourceRepository } from "./resourceRepository";
import { Resource } from "./resourceModel";
import { Rule } from "../game/gameModel";
import path from "path";

interface NestedRule {
  title: string;
  content: string[];
  level: number;
  children: NestedRule[];
}

export class ResourceService {
  private resourceRepository: ResourceRepository;

  constructor(repository: ResourceRepository = new ResourceRepository()) {
    this.resourceRepository = repository;
  }

  // Retrieves all resources from the database
  async findAll(): Promise<ServiceResponse<Resource[] | null>> {
    try {
      const resources = await this.resourceRepository.findAll();
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
      const resource = await this.resourceRepository.findById(id);
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

      const resourceCode = await this.resourceRepository.uploadFile(
        { userId: writer.userId, userCode: writer.userCode },
        resourceData,
        rules,
      );
      return ServiceResponse.success<string>(
        "Resource created successfully",
        resourceCode,
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

export const resourceService = new ResourceService();
