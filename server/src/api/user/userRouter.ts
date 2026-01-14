import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import {
  BlockUserSchema,
  CreateUserSchema,
  DisableUserSchema,
  GetUserSchema,
  SignInSchema,
  UserSchema,
} from "@/api/user/userModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import {
  validateRequest,
  validateRole,
  validateToken,
} from "@/common/utils/httpHandlers";
import { userController } from "./userController";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.register("User", UserSchema);

// get all users - admin only
userRegistry.registerPath({
  method: "get",
  path: "/user",
  tags: ["User"],
  responses: createApiResponse(z.array(UserSchema), "Success"),
});

userRouter.get(
  "/",
  validateToken(),
  validateRole(["admin"]),
  userController.getUsers
);

// get user information by id - verified users
userRegistry.registerPath({
  method: "get",
  path: "/user/{id}",
  tags: ["User"],
  request: { params: GetUserSchema.shape.params },
  responses: createApiResponse(UserSchema, "Success"),
});

userRouter.get(
  "/:id",
  validateRequest(GetUserSchema),
  validateToken(),
  userController.getUser
);

// create new user - no authentication
userRegistry.registerPath({
  method: "post",
  path: "/user/create",
  tags: ["User"],
  request: {
    body: { content: { "application/json": { schema: CreateUserSchema } } },
  },
  responses: createApiResponse(UserSchema, "User Created Successfully"),
});

userRouter.post(
  "/create",
  validateRequest(CreateUserSchema),
  userController.createUser
);

// disable user - admin only
userRegistry.registerPath({
  method: "post",
  path: "/user/disable",
  tags: ["User"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: DisableUserSchema,
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({ success: z.boolean() }),
    "User Disabled Successfully"
  ),
});

userRouter.post(
  "/disable",
  validateRequest(DisableUserSchema),
  validateToken(),
  validateRole(["admin"]),
  userController.disableUser
);

// block user - admin only
userRegistry.registerPath({
  method: "post",
  path: "/user/block",
  tags: ["User"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: BlockUserSchema,
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({ success: z.boolean() }),
    "User Blocked Successfully"
  ),
});

userRouter.post(
  "/block",
  validateRequest(BlockUserSchema),
  validateToken(),
  validateRole(["admin"]),
  userController.blockUser
);

// sigin in user - no authentication
userRegistry.registerPath({
  method: "post",
  path: "/user/signin",
  tags: ["User"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: SignInSchema,
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
    }),
    "Sign-In Successful"
  ),
});

userRouter.post(
  "/signin",
  validateRequest(SignInSchema),
  userController.signIn
);

// signout user - verified users
userRegistry.registerPath({
  method: "post",
  path: "/user/signout",
  tags: ["User"],
  responses: createApiResponse(
    z.object({ success: z.boolean() }),
    "Sign-Out Successful"
  ),
});

userRouter.post("/signout", validateToken(), userController.signOut);

// verify user email - no authentication
userRegistry.registerPath({
  method: "post",
  path: "/user/verify-email/:token",
  tags: ["User"],
  responses: createApiResponse(
    z.object({ success: z.boolean() }),
    "Email Verified Successfully"
  ),
});

userRouter.post("/verify-email/:token", userController.verifyUserEmail);

//
