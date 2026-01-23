import { ollama } from "../llms/llama/ollama";

export class GameService {
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
}
