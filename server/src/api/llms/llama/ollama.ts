import { env } from "@/common/utils/envConfig";
import { Ollama } from "ollama";

export const ollama = new Ollama({
  host: env.OLLAMA_HOST,
});
