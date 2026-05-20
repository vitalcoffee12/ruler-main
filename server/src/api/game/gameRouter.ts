import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { gameController } from "./gameController";

export const gameRegistry = new OpenAPIRegistry();
export const gameRouter: Router = express.Router();

gameRegistry.registerPath({
  method: "post",
  path: "/game/add-element",
  tags: ["Game"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            guildCode: z.string(),
            element: z.any(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(
    z.boolean(),
    "Element Successfully added to game",
  ),
});
gameRouter.post("/add-element", gameController.addElement);

// create new game element - no authentication
gameRegistry.registerPath({
  method: "post",
  path: "/game/request-element",
  tags: ["Game"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            guildCode: z.string(),
            description: z.string(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(z.boolean(), "Request Successfully sent"),
});
gameRouter.post("/request-element", gameController.requestElement);

//
gameRegistry.registerPath({
  method: "post",
  path: "/game/modify-element",
  tags: ["Game"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            guildCode: z.string(),
            elementName: z.string(),
            element: z.any(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(z.boolean(), "Element Successfully updated"),
});
gameRouter.post("/modify-element", gameController.updateElement);

gameRegistry.registerPath({
  method: "get",
  path: "/game/element-details/{guildCode}/{elementName}",
  tags: ["Game"],
  request: {
    params: z.object({
      guildCode: z.string(),
      elementName: z.string(),
    }),
  },
  responses: createApiResponse(z.boolean(), "Element Successfully retrieved"),
});
gameRouter.get(
  "/element-details/:guildCode/:elementName",
  gameController.getElementById,
);

gameRegistry.registerPath({
  method: "post",
  path: "/game/send-message",
  tags: ["Game"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            userId: z.number(),
            guildCode: z.string(),
            message: z.string(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(z.boolean(), "Message Successfully sent"),
});
gameRouter.post("/send-message", gameController.sendMessage);

gameRegistry.registerPath({
  method: "post",
  path: "/game/world",
  tags: ["Game"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            guildCode: z.string(),
            page: z.number().optional(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({
      entities: z.array(z.any()),
      hasMore: z.boolean(),
    }),
    "World retrieved successfully",
  ),
});
gameRouter.post("/world", gameController.getWorld);

gameRegistry.registerPath({
  method: "post",
  path: "/game/chat",
  tags: ["Game"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            guildCode: z.string(),
            page: z.number().optional(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({
      history: z.array(z.any()),
      hasMore: z.boolean(),
    }),
    "Chat retrieved successfully",
  ),
});
gameRouter.post("/chat", gameController.getChat);
