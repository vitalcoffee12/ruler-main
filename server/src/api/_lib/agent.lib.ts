import { ollama } from "../llms/llama/ollama";
import { Entity, Rule } from "../game/gameModel";
import { FORMAT, MODELS, PROMPTS } from "../constants";

export class AgentLib {
  // 기본 챗, 이후 여러 모델 또는, 상용 LLM의 API로 확장을 고려할 필요 있음.
  // TODO : 다중 모델 선택 지원, 상용 LLM 지원
  // TODO : 스트리밍 출력 고려
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

  // 텍스트 임베딩 생성
  // TODO : 다중 모델 선택 지원, 상용 LLM 지원
  async embedText(text: string): Promise<number[] | null> {
    const res = await ollama.embed({
      model: MODELS.qwen_embedding,
      input: text,
    });

    return (res?.embeddings ?? [])[0] ?? null;
  }

  // async embedObject<T>(
  //   target: T,
  //   key: keyof T,
  //   field: string = "embedding",
  // ): Promise<any> {
  //   const targetString = target[key];
  //   const embedding = await this.embedText(targetString as string);
  //   (target as any)[field] = embedding;

  //   return target;
  // }

  // MD 파일로부터 규칙 세트를 포맷팅
  async formatRuleSet(resource: Rule[]): Promise<Rule[] | null> {
    // format md file to rule
    try {
      const split = 5;
      const overlap = 2;
      let idx = 0;
      for (const item of resource) {
        idx += 1;
        console.log(`${idx}/${resource.length} : ${item.title}`);
        if (!item.content || item.content.length === 0) {
          console.log("  - No content, skip");
          continue;
        }
        item.keywords = [];

        for (let i = 0; i < item.content.length; i += split - overlap) {
          console.log(
            `  - Chunk ${i + 1}/${Math.ceil(item.content.length / (split - overlap))} (${item.content.length})`,
          );
          const chunk = item.content.slice(i, i + split).join("\n");

          const prompt = PROMPTS.RULE_EDITOR(chunk);

          const res = await this.chat(
            MODELS.llama3,
            [
              {
                role: "user",
                content: prompt,
              },
            ],
            FORMAT.RULE_EDITOR,
          );
          const parsed = JSON.parse(res);

          item.keywords.push(...parsed.keywords);
          item.summary = parsed.summary;
          item.updatedAt = new Date();
        }
      }

      return resource;
    } catch (error) {
      console.error("Error formatting rule set:", error);
      return null;
    }
  }

  async generateEntities(
    topic: string,
    options?: {
      model?: string;
      maxCounts?: number;
      terms?: string;
      refs?: string;
      ids?: string;
    },
  ): Promise<{ data: Entity[]; prompt: string }> {
    const mc = options?.maxCounts || 5;
    const prompt = PROMPTS.GAME_DESIGNER(
      options?.terms || "",
      topic,
      mc,
      options?.refs || "",
      options?.ids || "",
    );
    const res = await this.chat(
      MODELS.llama3,
      [
        {
          role: "user",
          content: prompt,
        },
      ],
      FORMAT.CREATE_WORLD,
    );
    const parsed = JSON.parse(res);

    return { data: parsed, prompt };
  }

  async generateNarrative(
    messages: { role: string; content: string }[],
    options?: {
      model?: string;
      topic?: string;
      terms?: string;
      refs?: string;
    },
  ) {
    const prompt = PROMPTS.NARRATOR(options?.refs || "");
    const res = await this.chat(
      MODELS.llama3,
      [
        ...messages,
        {
          role: "user",
          content: prompt,
        },
      ],
      FORMAT.NARRATIVE,
    );
    const parsed = JSON.parse(res);

    return {
      data: parsed,
      prompt,
    };
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
      "",
    );

    return [];
  }

  async searchEntities(
    query: string,
    options?: {
      model?: string;
      maxResults?: number;
    },
  ) {
    return [];
  }

  async searchRules(
    query: string,
    options?: {
      model?: string;
      maxResults?: number;
    },
  ) {
    return [];
  }

  async searchTerms(
    query: string,
    options?: {
      model?: string;
      maxResults?: number;
    },
  ) {
    return [];
  }
}

export const agentLib = new AgentLib();
