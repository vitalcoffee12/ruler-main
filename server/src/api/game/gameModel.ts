import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type Chat = z.infer<typeof ChatSchema>;
export const ChatSchema = z.object({
  id: z.number().optional(),
  userId: z.number(),
  message: z.string(),
  createdAt: z.date(),
});

export type Entity = z.infer<typeof EntitySchema>;
export const EntitySchema = z.object({
  type: z.string(),
  name: z.string(),
  description: z.string().optional(),
  rules: z.array(
    z.object({
      id: z.number(),
      version: z.number(),
    }),
  ),
  scoreDiff: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Rule = z.infer<typeof RuleSchema>;
export const RuleSchema = z.object({
  id: z.number().optional(),
  version: z.number(),
  title: z.string(),
  content: z.array(z.string()),
  keywords: z.array(z.object({ term: z.string(), description: z.string() })),
  categories: z.array(z.string()),
  children: z.array(z.number()),
  summary: z.string().optional(),
  embedding: z.array(z.number()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Term = z.infer<typeof TermSchema>;
export const TermSchema = z.object({
  id: z.number().optional(),
  version: z.number(),
  term: z.string(),
  description: z.string(),
  embedding: z.array(z.number()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type RuleFormat = z.infer<typeof RuleFormatSchema>;
export const RuleFormatSchema = z.object({
  keywords: z.array(
    z.object({
      term: z.string(),
      description: z.string(),
    }),
  ),
});
// game turn : free talks(several game histories) -> flag up -> AI agent run -> scene history -> AI agent game histories

export type GameHistory = z.infer<typeof GameHistorySchema>;
export const GameHistorySchema = z.object({
  id: z.number().optional(),
  sceneId: z.number(),
  chat: z
    .object({
      userId: z.number(),
      userCode: z.string(),
      message: z.string(),
    })
    .optional(),
  entities: z.array(EntitySchema),
  tasks: z
    .array(
      z.object({
        type: z.string(),
        input: z.string().optional(),
        output: z.string().optional(),
      }),
    )
    .optional(),
  citations: z
    .array(
      z.object({
        ruleId: z.number(),
        content: z.string(),
        description: z.string().optional(),
      }),
    )
    .optional(),
  rankedTerms: z
    .array(
      z.object({
        termId: z.number(),
        score: z.number(),
      }),
    )
    .optional(),
  rankedEntities: z
    .array(
      z.object({
        entityId: z.number(),
        score: z.number(),
      }),
    )
    .optional(),
  createdAt: z.date(),
});

export type SceneHistory = z.infer<typeof SceneHistorySchema>;
export const SceneHistorySchema = z.object({
  id: z.number().optional(), // scene => set of game histories
  message: z.string(), // ai agent's message for the scene
  sceneDescription: z.string(), // description of the scene
  gameHistories: z.array(GameHistorySchema), // game histories within the scene
  tasks: z // tasks performed in the scene
    .array(
      z.object({
        type: z.string(),
        input: z.string().optional(),
        output: z.string().optional(),
      }),
    )
    .optional(),
  citations: z // citations used in the scene
    .array(
      z.object({
        ruleId: z.number(),
        content: z.string(),
        description: z.string().optional(),
      }),
    )
    .optional(),
  rankedTerms: z // ranked terms in the scene
    .array(
      z.object({
        termId: z.number(),
        score: z.number(),
      }),
    )
    .optional(),
  rankedEntities: z // ranked entities in the scene
    .array(
      z.object({
        entityId: z.number(),
        score: z.number(),
      }),
    )
    .optional(),
  createdAt: z.date(),
});
