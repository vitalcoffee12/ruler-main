import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateGuildSchema, GetGuildSchema, GuildSchema } from "./guildModel";
import { guildController } from "./guildController";
import {
  validateRequest,
  validateRole,
  validateToken,
} from "@/common/utils/httpHandlers";

export const guildRegistry = new OpenAPIRegistry();
export const guildRouter: Router = express.Router();

guildRegistry.register("Guild", GuildSchema);

// get all guilds - admin only
guildRegistry.registerPath({
  method: "get",
  path: "/guild",
  tags: ["Guild"],
  responses: createApiResponse(z.array(GuildSchema), "Success"),
});

guildRouter.get(
  "/",
  validateToken(),
  validateRole(["admin"]),
  guildController.getGuilds,
);

// get guild information by id - verified guilds
guildRegistry.registerPath({
  method: "get",
  path: "/guild/code/{code}",
  tags: ["Guild"],
  request: { params: GetGuildSchema.shape.params },
  responses: createApiResponse(GuildSchema, "Success"),
});

guildRouter.get(
  "/code/:code",
  validateRequest(GetGuildSchema),
  validateToken(),
  guildController.getGuild,
);

guildRegistry.registerPath({
  method: "get",
  path: "/guild/user",
  tags: ["Guild"],
  responses: createApiResponse(z.array(GuildSchema), "Success"),
});

guildRouter.get("/user", validateToken(), guildController.getGuildsByUser);

// create new guild - no authentication
guildRegistry.registerPath({
  method: "post",
  path: "/guild/create",
  tags: ["Guild"],
  request: {
    body: { content: { "application/json": { schema: CreateGuildSchema } } },
  },
  responses: createApiResponse(GuildSchema, "Guild Created Successfully"),
});

guildRouter.post(
  "/create",
  validateRequest(CreateGuildSchema),
  guildController.createGuild,
);

//

guildRegistry.registerPath({
  method: "post",
  path: "/guild/invite",
  tags: ["Guild"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            guildCode: z.string(),
            userId: z.number(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(GuildSchema, "Guild Created Successfully"),
});

guildRouter.post(
  "/invite",

  guildController.sendInvitation,
);
