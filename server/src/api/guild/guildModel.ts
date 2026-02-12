import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export const GuildState = z.enum(["active", "disabled"]);
export const GuildRole = z.enum(["user", "owner", "manager"]);
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

export type GuildMember = z.infer<typeof GuildMemberSchema>;
export const GuildMemberSchema = z.object({
  id: z.number().optional(),
  guildId: z.number(),
  guildCode: z.string(),
  iconPath: z.string().optional(),
  displayName: z.string().optional(),
  userId: z.number(),
  userCode: z.string(),
  role: z.string(),
  joinedAt: z.date(),
});

export type GuildResource = z.infer<typeof GuildResourceSchema>;
export const GuildResourceSchema = z.object({
  id: z.number().optional(),
  guildId: z.number(),
  guildCode: z.string(),
  resourceId: z.number(),
  resourceCode: z.string(),
  type: z.enum(["ruleSet", "termSet"]),
  version: z.number().default(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GuildMemberWithUser = z.infer<typeof GuildMemberWithUserSchema>;
export const GuildMemberWithUserSchema = GuildMemberSchema.extend({
  iconPath: z.string().optional(),
});

// Input Validation for 'GET guilds/:id' endpoint
export const GetGuildSchema = z.object({
  params: z.object({ code: commonValidations.code }),
});
export const CreateGuildSchema = z.object({
  body: z.object({
    ownerId: commonValidations.id,
    name: z.string(),
    iconPath: z.string().optional(),
    description: z.string().optional(),
  }),
});
export const DisableGuildSchema = z.object({
  body: z.object({ code: commonValidations.code }),
});
