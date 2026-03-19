import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
extendZodWithOpenApi(z);

export type Resource = z.infer<typeof ResourceSchema>;
export const ResourceSchema = z.object({
  id: z.number().optional(),
  code: z.string(),
  imagePath: z.string().optional(),
  filePath: z.string().optional(),
  ownerId: z.number(),
  ownerCode: z.string(),
  distributors: z.array(z.string()),
  type: z.string(),
  name: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()),
  visibility: z.enum(["public", "private", "unlisted"]),
  downloadCount: z.number().optional(),
  favoriteCount: z.number().optional(),
  rating: z.number().optional(),
  reviews: z.number().optional(),
  version: z.number().optional(),
  verifiedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Document = z.infer<typeof DocumentSchema>;
export const DocumentSchema = z.object({
  id: z.number(),
  docCode: z.string(),
  docVersion: z.number(),
  title: z.string(),
  categories: z.array(z.string()),
  content: z.array(z.string()),
  children: z.array(z.number()),
  embedding: z.array(z.number()).optional(),
  summary: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
