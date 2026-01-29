import mongoose from "mongoose";
import { GameRepository } from "./gameRepository";
import fs from "fs";
import { Rule } from "./gameModel";
import { GenerateRuleSetCode } from "../utils";

interface NestedRule {
  title: string;
  content: string[];
  level: number;
  children: NestedRule[];
}

export class RuleService {
  constructor(private gameRepository: GameRepository = new GameRepository()) {}

  // split markdown into nested rules (4)
  splitRules(title: string, markdown: string, level: number): NestedRule {
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
        result.content.push(paragraphs.trim());
        continue;
      }

      const subtitle = items[i].split("\n")[0].trim();
      const content = items[i].substring(subtitle.length).trim();

      const child = this.splitRules(subtitle, content, level + 1);
      // process each item
      children.push(child);
    }
    result.children = children;
    return result;
  }

  // flat nested rule and give unique id for each item (3)
  NestedRuleToRule(
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
      const childRules = this.NestedRuleToRule(currentId, subCategories, child);
      childrenRules.push(...childRules.rules);
      currentId = childRules.endId;
    }

    rules.push(rule);
    rules.push(...childrenRules);

    return { rules, endId: currentId };
  }

  // given markdown file, build rules (2)
  async buildRuleFromMarkdown(
    filename: string = "Blades-in-the-Dark-SRD.md",
  ): Promise<Rule[]> {
    const path = `./uploads/${filename}`;
    let rules: Rule[] = [];
    fs.readFile(path, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      const nestedRule = this.splitRules("Blades in the Dark", data, 0);
      rules = this.NestedRuleToRule(1, [], nestedRule).rules;
    });
    return rules;
  }

  // given markdown file, build rule set in DB (1)
  async buildRuleSetDB(
    filename: string,
    options?: {
      ruleSetName?: string;
      description?: string;
      embeddingSize?: number;
    },
  ) {
    const ruleSetCode = GenerateRuleSetCode();
    await this.gameRepository.createRuleSet(ruleSetCode, {
      name: options?.ruleSetName || "Default Rule Set",
      description: options?.description || `Imported from ${filename}`,
    });

    const rules = await this.buildRuleFromMarkdown(filename);
    await this.gameRepository.insertRuleToRuleSet(ruleSetCode, rules);

    return ruleSetCode;
  }
}
