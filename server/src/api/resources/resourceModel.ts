import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import {
  commonValidations,
  userValidations,
} from "@/common/utils/commonValidation";

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
  type: z.enum(["ruleSet", "termSet"]),
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

// Input Validation for 'GET users/:id' endpoint
// export const GetResourceSchema = z.object({
//   params: z.object({ id: commonValidations.id }),
// });
// export const CreateUserSchema = z.object({
//   body: z.object({
//     name: userValidations.name,
//     email: userValidations.email,
//     password: userValidations.password,
//   }),
// });
// export const DisableUserSchema = z.object({
//   body: z.object({ id: commonValidations.id }),
// });
// export const BlockUserSchema = z.object({
//   body: z.object({
//     id: commonValidations.id,
//     blockedUntil: userValidations.blockedUntil,
//   }),
// });
// export const ChangeUserPasswordSchema = z.object({
//   params: z.object({ id: commonValidations.id }),
//   body: z.object({
//     oldPassword: userValidations.password,
//     newPassword: userValidations.password,
//   }),
// });
// export const RefreshTokenSchema = z.object({
//   body: z.object({ refreshToken: userValidations.refreshToken }),
// });

// export const findAccountByEmailSchema = z.object({
//   body: z.object({ email: userValidations.email }),
// });

// export const ResetPasswordSchema = z.object({
//   body: z.object({
//     email: userValidations.email,
//     newPassword: userValidations.password,
//     resetToken: z.string().min(1, "Reset token cannot be empty"),
//   }),
// });

// export const SignInSchema = z.object({
//   body: z.object({
//     email: userValidations.email,
//     password: userValidations.password,
//   }),
// });

// export type ValidateTokenResponse = z.infer<typeof ValidateTokenResponseSchema>;
// export const ValidateTokenResponseSchema = z.object({
//   id: z.number(),
//   code: z.string(),
//   displayName: z.string().optional(),
//   state: z.string(),
//   role: z.string(),
//   accessToken: z.string(),
//   refreshToken: z.string(),
// });
