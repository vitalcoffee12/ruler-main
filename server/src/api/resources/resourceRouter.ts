import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { UserSchema } from "@/api/user/userModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRole, validateToken } from "@/common/utils/httpHandlers";
import { ResourceSchema } from "./resourceModel";
import { resourceController } from "./resourceController";

export const resourceRegistry = new OpenAPIRegistry();
export const resourceRouter: Router = express.Router();

resourceRegistry.register("Resource", ResourceSchema);

resourceRegistry.registerPath({
  method: "get",
  path: "/resource",
  tags: ["Resource"],
  responses: createApiResponse(z.array(ResourceSchema), "Success"),
});

resourceRouter.get(
  "/",
  validateToken(),
  //validateRole(["admin"]),
  resourceController.getResources,
);

resourceRegistry.registerPath({
  method: "get",
  path: "/resource/:id",
  tags: ["Resource"],
  request: { params: z.object({ id: z.number() }) },
  responses: createApiResponse(ResourceSchema, "Success"),
});

resourceRouter.get(
  "/detail/:id",
  validateToken(),
  resourceController.getResourceById,
);

resourceRegistry.registerPath({
  method: "post",
  path: "/resource/upload",
  tags: ["Resource"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            writer: UserSchema.pick({ id: true, code: true }),
            resourceData: ResourceSchema.pick({
              name: true,
              description: true,
              filePath: true,
            }),
          }),
        },
      },
    },
  },
  responses: createApiResponse(ResourceSchema, "Resource Created"),
});

resourceRouter.post(
  "/upload",
  validateToken(),
  resourceController.uploadResource,
);

resourceRegistry.registerPath({
  method: "post",
  path: "/resource/format",
  tags: ["Resource"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(ResourceSchema, "Resource Formatted"),
});

resourceRouter.post(
  "/format",
  validateToken(),
  resourceController.formatResource,
);
