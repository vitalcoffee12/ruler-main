import { ollama } from "../llms/llama/ollama";
import { Entity, Rule } from "./gameModel";

export class AgentService {
  async chat(
    model: string,
    messages: { role: string; content: string }[],
    format: any,
  ): Promise<string> {
    const res = await ollama.chat({
      model: model,
      messages: messages,
      stream: false,
      format: format,
    });
    return res?.message?.content ?? "";
  }

  async embedText(text: string): Promise<number[] | null> {
    const res = await ollama.embed({
      model: "ruler-embeddings",
      input: text,
    });
    return (res?.embeddings ?? [])[0] ?? null;
  }

  formatRule(path: string): Rule[] {
    // format md file to rule

    return [];
  }

  async extractKeywords(text: string, options?: { model?: string }) {
    const res = await this.chat(
      options?.model || "llama3.3b",
      [
        {
          role: "system",
          content: `You are an expert at extracting keywords from text. Given the following text, extract the most relevant keywords that capture the main topics and themes. Return the keywords as a JSON array.`,
        },
        { role: "user", content: `Text: ${text}` },
      ],
      { type: "json" },
    );
    return JSON.parse(res) as string[];
  }

  async generateTermDefinition(
    term: string,
    options?: {
      model?: string;
    },
  ) {}

  async buildRuleGraph(rules: Rule[]) {}

  //

  async generateEntities(
    topic: string,
    options?: {
      model?: string;
      maxCounts?: number;
    },
  ) {}

  async generateNarrative(
    messages: { role: string; content: string }[],
    options?: {
      model?: string;
      topic?: string;
      entities?: string[];
    },
  ) {
    return "";
  }

  async generateRuleDescription(
    rules: Rule[],
    options?: {
      model?: string;
    },
  ) {}

  async generateEdits(
    narrative: string,
    options?: {
      model?: string;
      entities?: string[];
    },
  ): Promise<Entity[]> {
    const res = await this.chat(
      options?.model || "llama3.3b",
      [
        {
          role: "system",
          content: `You are an expert game designer. Your task is to help create a list of entities for a game based on the provided narrative and existing entities.`,
        },
        { role: "user", content: `Narrative: ${narrative}` },
      ],
      { type: "json" },
    );

    return [];
  }
}
