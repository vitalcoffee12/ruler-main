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
