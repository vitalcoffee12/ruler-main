import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
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
            elementId: z.string(),
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
  path: "/game/element-details/{guildCode}/{elementId}",
  tags: ["Game"],
  request: {
    params: z.object({
      guildCode: z.string(),
      elementId: z.string(),
    }),
  },
  responses: createApiResponse(z.boolean(), "Element Successfully retrieved"),
});

gameRouter.get(
  "/element-details/:guildCode/:elementId",
  gameController.getElementById,
);
