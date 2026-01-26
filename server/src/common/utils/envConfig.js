import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
  HOST: z.string().min(1).default("localhost"),
  PORT: z.coerce.number().int().positive().default(8080),
  CORS_ORIGIN: z.string().url().default("http://localhost:8080"),

  // rate limit
  COMMON_RATE_LIMIT_MAX_REQUESTS: z.coerce
    .number()
    .int()
    .positive()
    .default(1000),
  COMMON_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(1000),

  // database variables
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  DB_USER: z.string().min(1),
  DB_PASS: z.string().min(1),
  DB_NAME: z.string().min(1),

  DB_MONGO_URI: z.string().min(1),
  DB_MONGO_NAME: z.string().min(1),
  DB_MONGO_USER: z.string().min(1),
  DB_MONGO_PASS: z.string().min(1),

  // JWT secret
  ACCESSTOKEN_SECRET: z.string().min(1),
  REFRESHTOKEN_SECRET: z.string().min(1),
  PASSTOKEN_SECRET: z.string().min(1),
  EMAILTOKEN_SECRET: z.string().min(1),

  // Hashing Settings
  PASS_HASH_SALTS: z.coerce.number().min(1), // Number of salt rounds for password hashing
  PASS_HASH_PEPPER: z.string().min(1), // Pepper for password hashing

  TOKEN_HASH_SALTS: z.coerce.number().min(1), // Number of salt rounds for token hashing
  TOKEN_HASH_PEPPER: z.string().min(1), // Pepper for token hashing

  OAUTH_GOOGLE_CLIENT_ID: z.string().min(1), // Google OAuth Client ID
  OAUTH_GOOGLE_CLIENT_SECRET: z.string().min(1), // Google OAuth Client Secret
  OAUTH_GOOGLE_REDIRECT_URI: z.string().min(1), // Google OAuth Redirect URI
  OAUTH_GITHUB_CLIENT_ID: z.string().min(1), // GitHub OAuth Client ID
  OAUTH_GITHUB_CLIENT_SECRET: z.string().min(1), // GitHub OAuth Client Secret
  OAUTH_GITHUB_REDIRECT_URI: z.string().min(1), // GitHub OAuth Redirect URI
  OAUTH_KAKAO_CLIENT_ID: z.string().min(1), // Kakao OAuth Client ID
  OAUTH_KAKAO_CLIENT_SECRET: z.string().min(1), // Kakao OAuth Client Secret
  OAUTH_KAKAO_REDIRECT_URI: z.string().min(1), // Kakao OAuth Redirect URI
  OAUTH_NAVER_CLIENT_ID: z.string().min(1), // Naver OAuth Client ID
  OAUTH_NAVER_CLIENT_SECRET: z.string().min(1), // Naver OAuth Client Secret
  OAUTH_NAVER_REDIRECT_URI: z.string().min(1), // Naver OAuth Redirect URI
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}

export const env = {
  ...parsedEnv.data,
  isDevelopment: parsedEnv.data.NODE_ENV === "development",
  isProduction: parsedEnv.data.NODE_ENV === "production",
  isTest: parsedEnv.data.NODE_ENV === "test",
};
