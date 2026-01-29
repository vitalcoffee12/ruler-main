import { z } from "zod";

export const commonValidations = {
  id: z.number().min(1, "ID must be a positive number"),
  // ... othe common validations
  code: z.string().min(1, "Code cannot be empty"),
};

export const userValidations = {
  email: z.string(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(50, "Password must be at most 50 characters long")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[\W_]/, "Password must contain at least one special character"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must be at most 50 characters long"),
  refreshToken: z.string().min(1, "Refresh token cannot be empty"),
  blockedUntil: z.date().refine((date) => date > new Date(), {
    message: "blockedUntil must be a future date",
  }),
};
