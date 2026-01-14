import bcrypt from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import { env } from "./envConfig";

export async function hashPass(password: string): Promise<string> {
  // Dummy hash function for illustration; replace with a real hashing algorithm
  const salt = await bcrypt.genSalt(env.PASS_HASH_SALTS);
  return await bcrypt.hash(`${password}${env.PASS_HASH_PEPPER}`, salt);
}

export async function comparePass(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(
    `${password}${env.PASS_HASH_PEPPER}`,
    hashedPassword
  );
}

export async function hashToken(token: string): Promise<string> {
  const salt = await bcrypt.genSalt(env.TOKEN_HASH_SALTS);
  return await bcrypt.hash(`${token}${env.TOKEN_HASH_PEPPER}`, salt);
}

export async function compareToken(
  token: string,
  hashedToken: string
): Promise<boolean> {
  return await bcrypt.compare(`${token}${env.TOKEN_HASH_PEPPER}`, hashedToken);
}

export function issueAccessToken(userId: number, role: string) {
  const accessToken = sign({ userId, role }, env.ACCESSTOKEN_SECRET, {
    expiresIn: "1h",
  });
  return accessToken;
}

export function issueRefreshToken(userId: number, role: string) {
  const refreshToken = sign({ userId, role }, env.REFRESHTOKEN_SECRET, {
    expiresIn: "14d",
  });
  return refreshToken;
}

export function verifyAccessToken(token: string) {
  return verify(token, env.ACCESSTOKEN_SECRET);
}

export function verifyRefreshToken(token: string) {
  return verify(token, env.REFRESHTOKEN_SECRET);
}
