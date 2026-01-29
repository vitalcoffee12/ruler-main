import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { ZodError, ZodSchema } from "zod";
import { ServiceResponse } from "@/common/models/serviceResponse";
import AppDataSource from "@/dataSource";
import { UserEntity } from "@/entities/userEntity";
import {
  hashToken,
  issueAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "./auth";

export const validateRequest =
  (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      const errors = (err as any)?.errors.map((e: any) => {
        const fieldPath = e?.path.length > 0 ? e?.path.join(".") : "root";
        return `${fieldPath}: ${e.message}`;
      });

      const errorMessage =
        errors.length === 1
          ? `Invalid input: ${errors[0]}`
          : `Invalid input (${errors.length} errors): ${errors.join("; ")}`;

      const statusCode = StatusCodes.BAD_REQUEST;
      const serviceResponse = ServiceResponse.failure(
        errorMessage,
        null,
        statusCode,
      );
      res.status(serviceResponse.statusCode).send(serviceResponse);
    }
  };

export const validateToken =
  () => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.header("Authorization");
      const refreshToken = req.header("x-refresh-token");
      if (accessToken) {
        const token = accessToken.replace("Bearer ", "");
        try {
          const decodedToken = verifyAccessToken(token) as {
            userId: number;
            role: string;
          };
          if (decodedToken.userId && decodedToken.userId > 0) {
            req.headers["userId"] = decodedToken.userId.toString();
            next();
          }
        } catch (err) {
          // access token invalid. Try refresh token below
        }
      }
      if (refreshToken) {
        try {
          const decodedRefresh = verifyRefreshToken(refreshToken);
          const hashed = await hashToken(refreshToken);

          const userId = (decodedRefresh as { userId: number; role: string })
            .userId;
          // refresh token validation and issuing new access token
          if (userId && userId > 0) {
            const user = await AppDataSource.manager.findOneBy(UserEntity, {
              id: userId,
            });

            if (user?.refreshTokenHash == hashed) {
              const newAccessToken = issueAccessToken(userId, user.role);

              res.setHeader("Authorization", `Bearer ${newAccessToken}`);
              req.headers["Authorization"] = `Bearer ${newAccessToken}`;
              req.headers["userId"] = userId.toString();
              next();
            }
          }
        } catch (err) {
          // refresh token invalid
        }
      }

      return ServiceResponse.failure(
        "Invalid token",
        null,
        StatusCodes.UNAUTHORIZED,
      );
    } catch (err) {
      return ServiceResponse.failure(
        "Invalid token",
        null,
        StatusCodes.UNAUTHORIZED,
      );
    }
  };

export const validateRole =
  (roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    // Placeholder for authentication validation logic
    // Implement your authentication checks here
    try {
      const accessToken = req.header("Authorization");

      if (!accessToken) {
        return res.status(StatusCodes.UNAUTHORIZED).send("Unauthorized");
      } else {
        // Validate access token and role
        const token = accessToken.replace("Bearer ", "");
        const decodedToken = verifyAccessToken(token) as {
          userId: number;
          role: string;
        };

        if (!roles.includes(decodedToken.role)) {
          return res.status(StatusCodes.UNAUTHORIZED).send("Unauthorized");
        }
      }

      next();
    } catch (err) {
      return res.status(StatusCodes.UNAUTHORIZED).send("Unauthorized");
    }
  };
