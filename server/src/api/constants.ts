export const MODELS = {
  //llama3: "llama3.3:latest",
  llama3: "llama3.1:8b",
  qwen_embedding: "qwen3-embedding:latest",
};

export const COLLECTION_SUFFIX = {
  DOCUMENTS: ".d",
  GAME: ".g",
  SCENARIO: ".s",
  QUEST: ".q",
  WORLD: ".w",
};

export const DEFAULT_PAGINATION = {
  LIMIT: 20,
  OFFSET: 0,
};

export const PREDEFINED_USER = {
  GUILD: (code: string, name: string) => ({
    id: "0",
    code: code,
    name: "assistant",
  }),
  SYSTEM: {
    id: "-1",
    code: "SYSTEM",
    name: "system",
  },
};

export const ENTITY_STATE = {
  UNLISTED: "unlisted",
  ACTIVE: "active",
  REMOVED: "removed",
};

export interface IGameCommand {
  target: string;
  memory: string;
}
