import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export const GuildState = z.enum(["active", "disabled"]);
export const GuildRole = z.enum(["user", "admin"]);
export type Guild = z.infer<typeof GuildSchema>;
export const GuildSchema = z.object({
  id: z.number().optional(),
  code: z.string(),
  ownerId: z.number(),
  name: z.string(),
  description: z.string().optional(),
  state: GuildState,
  autoFlag: z.boolean().default(false),
  sceneId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Input Validation for 'GET guilds/:id' endpoint
export const GetGuildSchema = z.object({
  params: z.object({ code: commonValidations.code }),
});
export const CreateGuildSchema = z.object({
  body: z.object({
    code: z.string(),
    ownerId: commonValidations.id,
    name: z.string(),
    iconPath: z.string().optional(),
    description: z.string().optional(),
  }),
});
export const DisableGuildSchema = z.object({
  body: z.object({ code: commonValidations.code }),
});
