import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { object, z } from "zod";

extendZodWithOpenApi(z);

export type Entity = z.infer<typeof EntitySchema>;
export const EntitySchema = z.object({
  name: z.string(),
  type: z.string(),
  location: z.string(),
  group: z.string().optional(), // group or category the entity belongs to
  // relations: z.array(z.object({ name: z.string(), type: z.string() })),
  // state: z.record(z.string(), z.string()),
  description: z.string(),
  personality: z.string().optional(),
  backstory: z.string().optional(),
  appearance: z.string().optional(),
  related: z.array(z.string()).optional(), // related entities' names
  route: z.array(z.string()).optional(),
  memory: z.array(z.string()),
});

export type ExtendEntity = z.infer<typeof ExtendEntity>;
export const ExtendEntity = EntitySchema.extend({
  lastScore: z.number(),
  lastSceneId: z.number(),
  retreivedCount: z.number(),
  preference: z.number(),
  documents: z.array(z.string()),
  isPreferred: z.boolean(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
});

export const defaultEntity: Entity = {
  name: "Unknown Entity",
  type: "object",
  description: "No description available.",
  location: "unknown",
  memory: [],
};

export const defaultExtendEntity: ExtendEntity = {
  ...defaultEntity,
  lastScore: 0,
  lastSceneId: 0,
  retreivedCount: 0,
  preference: 0,
  isPreferred: false,
  documents: [],
};

export type GameHistory = z.infer<typeof GameHistorySchema>;
export const GameHistorySchema = z.object({
  id: z.number().optional(),
  sceneId: z.number(),
  chat: z
    .object({
      userId: z.string(),
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
  createdAt: z.date(),
});

export type Quest = z.infer<typeof QuestSchema>;
export const QuestSchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  description: z.string(),
  isCompleted: z.boolean(),
  objective: z.string(),
  failureCondition: z.string().optional(),
  giver: z.string(),
  reward: z.number(),
  score: z.number(),
  ending: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Scenario = z.infer<typeof ScenarioSchema>;
export const ScenarioSchema = z.object({
  id: z.number().optional(),
  history: z.array(QuestSchema).optional(),
  entities: z.array(EntitySchema),
  currentQuest: QuestSchema.optional(),
  embedding: z.array(z.number()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
