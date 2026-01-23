import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type Chat = z.infer<typeof ChatSchema>;
export const ChatSchema = z.object({
  id: z.number().optional(),
  guildCode: z.string(),
  userId: z.number(),
  userName: z.string(),
  displayName: z.string().optional(),
  message: z.string(),
  createdAt: z.date(),
});

export type Game = z.infer<typeof GameSchema>;
export const GameSchema = z.object({
  id: z.number().optional(),
  guildCode: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Entity = z.infer<typeof EntitySchema>;
export const EntitySchema = z.object({
  id: z.number().optional(),
  type: z.string(),
  name: z.string(),
  description: z.string().optional(),
  rules: z.object({
    id: z.number(),
    content: z.string(),
    embed: z.string().optional(),
    keywords: z.array(z.string()),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Rule = z.infer<typeof RuleSchema>;
export const RuleSchema = z.object({
  id: z.number().optional(),
  content: z.string(),
  embed: z.string().optional(),
  keywords: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Term = z.infer<typeof TermSchema>;
export const TermSchema = z.object({
  id: z.number().optional(),
  term: z.string(),
  definition: z.string(),
  embed: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GameHistory = z.infer<typeof GameHistorySchema>;
export const GameHistorySchema = z.object({
  id: z.number().optional(),
  sceneId: z.number(),
  chat: ChatSchema.optional(),
  tasks: z.array(
    z.object({
      type: z.string(),
      input: z.string().optional(),
      output: z.string().optional(),
    }),
  ),
  citations: z.array(
    z.object({
      ruleId: z.number(),
      content: z.string(),
      description: z.string().optional(),
    }),
  ),
  rankedTerms: z.array(
    z.object({
      termId: z.number(),
      score: z.number(),
    }),
  ),
  rankedEntities: z.array(
    z.object({
      entityId: z.number(),
      score: z.number(),
    }),
  ),
  createdAt: z.date(),
});
