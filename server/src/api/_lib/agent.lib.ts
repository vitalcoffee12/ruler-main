import { ollama } from "../llms/llama/ollama";
import { Entity } from "../game/gameModel";
import { MODELS } from "../constants";
import { FORMAT, PROMPTS } from "./prompts";
import { Document } from "../resources/resourceModel";

// only llm function imported
export class AgentLib {
  // 기본 챗, 이후 여러 모델 또는, 상용 LLM의 API로 확장을 고려할 필요 있음.
  // TODO : 다중 모델 선택 지원, 상용 LLM 지원
  // TODO : 스트리밍 출력 고려
  async chat(
    model: string,
    messages: { role: string; content: string }[],
    format: any,
  ): Promise<string> {
    try {
      const res = await ollama.chat({
        model: model,
        messages: messages,
        stream: false,
        format: format,
      });
      return res?.message?.content ?? "";
    } catch (ex) {
      console.log(ex);
    }
    return "";
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

  // MD 파일로부터 문서 처리
  async processDoc(docs: Document[]): Promise<Document[] | null> {
    // format md file to rule
    try {
      const split = 5;
      const overlap = 2;
      let idx = 0;
      for (const item of docs) {
        idx += 1;
        console.log(`${idx}/${docs.length} : ${item.title}`);
        if (!item.content || item.content.length === 0) {
          console.log("  - No content, skip");
          continue;
        }

        for (let i = 0; i < item.content.length; i += split - overlap) {
          console.log(
            `  - Chunk ${i + 1}/${Math.ceil(item.content.length / (split - overlap))} (${item.content.length})`,
          );
          const chunk = item.content.slice(i, i + split).join("\n");
          const res = await this.chat(
            MODELS.llama3,
            [
              {
                role: "system",
                content: PROMPTS.DOC_PROCESSOR_SYSTEM(),
              },
              {
                role: "user",
                content: PROMPTS.DOC_PROCESSOR(chunk),
              },
            ],
            FORMAT.DOC_PROCESSOR,
          );
          const parsed = JSON.parse(res);
          item.summary = parsed.summary;
          item.updatedAt = new Date();
        }
      }
      return docs;
    } catch (error) {
      console.error("Error formatting rule set:", error);
      return null;
    }
  }

  async generateWorld(options?: {
    model?: string;
    description?: string;
    previousChat?: { role: string; content: string }[];
    doc?: string;
  }): Promise<any> {
    const res = await this.chat(
      MODELS.llama3,
      [
        {
          role: "system",
          content: PROMPTS.WORLD_GENERATOR_SYSTEM(
            options?.description ??
              "player did not give any description, focus on given document.",
          ),
        },
        ...(options?.previousChat ?? []),
        {
          role: "user",
          content: PROMPTS.WORLD_GENERATOR(
            options?.doc ?? "No document provided. Freely generate.",
          ),
        },
      ],
      FORMAT.WORLD_GENERATOR,
    );

    return JSON.parse(res);
  }

  async generateEntities(options?: {
    model?: string;
    theme?: string;
    request?: string;
    entities?: string;
    ids?: string;
  }): Promise<{ data: Entity[]; prompt: string }> {
    const prompt = PROMPTS.GAME_DESIGNER(
      options?.theme || "",
      options?.request || "",
      options?.entities || "",
      options?.ids || "",
    );
    const res = await this.chat(
      MODELS.llama3,
      [
        {
          role: "system",
          content: PROMPTS.GAME_DESIGNER_SYSTEM(),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      FORMAT.GAME_DESIGNER,
    );
    const parsed = JSON.parse(res);

    return { data: parsed, prompt };
  }

  async generateNarrative(
    players: string,
    input: string,
    options?: {
      model?: string;
      topic?: string;
      prevScene?: string;
      chatHistories?: { role: string; content: string }[];
      quests?: string;
      // documents?: string;
      // terms?: string;
      entities?: string;
      summary?: string;
    },
  ): Promise<{
    data: {
      content: string;
      // documents?: { id: number; comment: string }[];
      // terms?: { id: number; comment: string }[];
      summary: string;
    };
    prompt: string;
  }> {
    const prompt = PROMPTS.NARRATOR(
      players || "No players",
      input,
      options?.summary || "No previous adventure",
      // options?.documents || "No documents",
      // options?.terms || "No terms",
      options?.entities || "No entities",
    );

    const res = await this.chat(
      MODELS.llama3,
      [
        {
          role: "system",
          content: PROMPTS.NARRATOR_SYSTEM(),
        },
        ...(options?.chatHistories ?? []),
        {
          role: "user",
          content: prompt,
        },
      ],
      FORMAT.NARRATOR,
    );
    console.log("response/:", res);
    const parsed = res ? JSON.parse(res) : {};

    return {
      data: parsed,
      prompt,
    };
  }

  async generateEdits(options?: {
    model?: string;
    players?: string;
    narrative?: string;
    sceneDescription?: string;
    quests?: string;
    entities?: string;
  }): Promise<{
    data: Entity[];
    prompt: string;
  }> {
    const prompt = PROMPTS.EDITOR(
      options?.players || "No players",
      options?.narrative || "No narrative",
      options?.sceneDescription || "No scene description",
      options?.quests || "No quets provided",
      options?.entities || "No entities",
    );

    const res = await this.chat(
      MODELS.llama3,
      [
        {
          role: "system",
          content: PROMPTS.EDITOR_SYSTEM(),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      FORMAT.EDITOR,
    );

    const parsed = res ? JSON.parse(res) : [];
    return {
      data: parsed,
      prompt,
    };
  }

  async generateCreates(options?: {
    model?: string;
    players?: string;
    narrative?: string;
    sceneDescription?: string;
    quests?: string;
    entities?: string;
  }): Promise<{
    data: Partial<Entity>[];
    prompt: string;
  }> {
    const prompt = PROMPTS.CREATOR(
      options?.players || "No players",
      options?.narrative || "No narrative",
      options?.sceneDescription || "No scene description",
      options?.quests || "No quets provided",
      options?.entities || "No entities",
    );

    const res = await this.chat(
      MODELS.llama3,
      [
        {
          role: "system",
          content: PROMPTS.CREATOR_SYSTEM(),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      FORMAT.CREATOR,
    );

    const parsed = res ? JSON.parse(res) : [];
    return {
      data: parsed,
      prompt,
    };
  }
}

export const agentLib = new AgentLib();
