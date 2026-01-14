import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import {
  commonValidations,
  userValidations,
} from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export const UserState = z.enum(["pending", "active", "disabled"]);
export const UserRole = z.enum(["user", "admin"]);
export type User = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  email: z.string().email(),
  state: UserState,
  role: UserRole,
  passwordHash: z.string(),
  googleId: z.string().optional(),
  githubId: z.string().optional(),
  kakaoId: z.string().optional(),
  naverId: z.string().optional(),
  refreshTokenHash: z.string().optional(),
  blockedUntil: z.date().optional(),
  lastSigninAt: z.date().optional(),
  createdAt: z.date(),
  verifiedAt: z.date().optional(),
  updatedAt: z.date(),
});

// Input Validation for 'GET users/:id' endpoint
export const GetUserSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});
export const CreateUserSchema = z.object({
  body: z.object({
    name: userValidations.name,
    email: userValidations.email,
    password: userValidations.password,
  }),
});
export const DisableUserSchema = z.object({
  body: z.object({ id: commonValidations.id }),
});
export const BlockUserSchema = z.object({
  body: z.object({
    id: commonValidations.id,
    blockedUntil: userValidations.blockedUntil,
  }),
});
export const ChangeUserPasswordSchema = z.object({
  params: z.object({ id: commonValidations.id }),
  body: z.object({
    oldPassword: userValidations.password,
    newPassword: userValidations.password,
  }),
});
export const RefreshTokenSchema = z.object({
  body: z.object({ refreshToken: userValidations.refreshToken }),
});

export const findAccountByEmailSchema = z.object({
  body: z.object({ email: userValidations.email }),
});

export const ResetPasswordSchema = z.object({
  body: z.object({
    email: userValidations.email,
    newPassword: userValidations.password,
    resetToken: z.string().min(1, "Reset token cannot be empty"),
  }),
});

export const SignInSchema = z.object({
  body: z.object({
    email: userValidations.email,
    password: userValidations.password,
  }),
});
