import { StatusCodes } from "http-status-codes";
import { sign, verify } from "jsonwebtoken";
import type { User, ValidateTokenResponse } from "@/api/user/userModel";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { env } from "@/common/utils/envConfig";
import {
  comparePass,
  compareToken,
  hashToken,
  issueAccessToken,
  issueRefreshToken,
} from "@/common/utils/auth";
import { OAUTH_PROVIDERS } from "@/common/constants";
import { userRepositroy } from "@/entities/userEntity";
import { GenerateUserCode } from "../utils";

export class UserService {
  constructor() {}

  // Retrieves all users from the database
  async findAll(): Promise<ServiceResponse<User[] | null>> {
    try {
      const users = await userRepositroy.find();
      if (!users || users.length === 0) {
        return ServiceResponse.failure(
          "No Users found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<User[]>("Users found", users);
    } catch (ex) {
      const errorMessage = `Error finding all users: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving users.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Retrieves a single user by their ID
  async findById(id: number): Promise<ServiceResponse<User | null>> {
    try {
      const user = await userRepositroy.findOne({ where: { id } });
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<User>("User found", user);
    } catch (ex) {
      const errorMessage = `Error finding user with id ${id}:, ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while finding user.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const user = await userRepositroy.findOne({ where: { email } });
    return !!user;
  }

  async create(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<ServiceResponse<boolean>> {
    try {
      const newUser = await userRepositroy.insert({
        code: GenerateUserCode(),
        displayName: userData.name,
        email: userData.email,
        passwordHash: userData.password, // In real implementation, hash the password
      });

      return ServiceResponse.success<boolean>(
        "User created successfully",
        true,
        StatusCodes.CREATED,
      );
    } catch (ex) {
      const errorMessage = `Error creating user: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while creating user.",
        false,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyEmail(verificationToken: string): Promise<ServiceResponse<null>> {
    if (!verificationToken || verificationToken.length === 0) {
      return ServiceResponse.failure(
        "Invalid verification token",
        null,
        StatusCodes.BAD_REQUEST,
      );
    }
    const verified = verify(verificationToken, env.EMAILTOKEN_SECRET);
    if (!verified) {
      return ServiceResponse.failure(
        "Invalid or expired verification token",
        null,
        StatusCodes.UNAUTHORIZED,
      );
    }
    const userId = (verified as any).userId;
    if (verified && userId && userId > 0) {
      const user = await userRepositroy.findOne({ where: { id: userId } });
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      user.verifiedAt = new Date();
      const success = await userRepositroy.save(user);
      if (!success) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
    }

    // Placeholder implementation
    return ServiceResponse.success<null>("Email verified successfully", null);
  }

  async disable(id: number): Promise<ServiceResponse<null>> {
    try {
      const user = await userRepositroy.findOne({ where: { id } });
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      user.state = "disabled";
      const success = await userRepositroy.save(user);
      if (!success) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<null>("User disabled successfully", null);
    } catch (ex) {
      const errorMessage = `Error disabling user with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while disabling user.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async block(id: number, blockedUntil: Date): Promise<ServiceResponse<null>> {
    try {
      const user = await userRepositroy.findOne({ where: { id } });
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      user.state = "blocked";
      user.blockedUntil = blockedUntil;
      const success = await userRepositroy.save(user);
      if (!success) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<null>("User blocked successfully", null);
    } catch (ex) {
      const errorMessage = `Error blocking user with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while blocking user.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async changePassword(
    id: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<ServiceResponse<null>> {
    try {
      const user = await userRepositroy.findOne({ where: { id } });
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }

      // In real implementation, verify oldPassword with stored passwordHash
      const checkOldPassword = oldPassword === user.passwordHash;
      if (!checkOldPassword) {
        return ServiceResponse.failure(
          "Old password is incorrect",
          null,
          StatusCodes.UNAUTHORIZED,
        );
      }
      user.passwordHash = newPassword; // In real implementation, hash the new password
      await userRepositroy.save(user); // Hash newPassword in real implementation
      return ServiceResponse.success<null>(
        "Password changed successfully",
        null,
      );
    } catch (ex) {
      const errorMessage = `Error changing password for user with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while changing password.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAccountByEmail(
    email: string,
  ): Promise<ServiceResponse<User | null>> {
    try {
      const user = await userRepositroy.findOne({ where: { email } });
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<User>("User found", user);
    } catch (ex) {
      const errorMessage = `Error finding user by email ${email}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while finding user by email.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resetPassword(
    id: number,
    newPassword: string,
    resetToken: string,
  ): Promise<ServiceResponse<null>> {
    try {
      const user = await userRepositroy.findOne({ where: { id } });
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      user.passwordHash = newPassword; // In real implementation, hash the new password and verify resetToken
      await userRepositroy.save(user); // Hash newPassword in real implementation
      return ServiceResponse.success<null>("Password reset successfully", null);
    } catch (ex) {
      const errorMessage = `Error resetting password for user with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while resetting password.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async refreshToken(
    id: number,
    refreshToken: string,
  ): Promise<ServiceResponse<null>> {
    try {
      const user = await userRepositroy.findOne({ where: { id } });
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      user.refreshTokenHash = refreshToken; // In real implementation, hash refreshToken
      await userRepositroy.save(user); // Hash refreshToken in real implementation
      return ServiceResponse.success<null>(
        "Refresh token updated successfully",
        null,
      );
    } catch (ex) {
      const errorMessage = `Error updating refresh token for user with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while updating refresh token.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<
    ServiceResponse<{
      accessToken: string;
      refreshToken: string;
    } | null>
  > {
    try {
      const user = await userRepositroy.findOne({ where: { email } });
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      // In real implementation, verify password with stored passwordHash
      const checkPassword = await comparePass(password, user.passwordHash);
      if (!checkPassword) {
        return ServiceResponse.failure(
          "Password is incorrect",
          null,
          StatusCodes.UNAUTHORIZED,
        );
      }

      const accessToken = issueAccessToken(user.id ?? 0, user.role);
      const refreshToken = issueRefreshToken(user.id ?? 0, user.role);
      const hashedRefreshToken = await hashToken(refreshToken);
      await userRepositroy.save({
        ...user,
        refreshTokenHash: hashedRefreshToken,
      });

      return ServiceResponse.success<{
        accessToken: string;
        refreshToken: string;
      }>("Sign-in successful", {
        accessToken,
        refreshToken,
      });
    } catch (ex) {
      const errorMessage = `Error signing in user with email ${email}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while signing in.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async signOut(id: number): Promise<ServiceResponse<null>> {
    try {
      if (!id || id <= 0) {
        return ServiceResponse.failure(
          "Invalid user ID",
          null,
          StatusCodes.BAD_REQUEST,
        );
      }
      const user = await userRepositroy.findOne({ where: { id } });
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      user.refreshTokenHash = "";
      await userRepositroy.save(user);
      return ServiceResponse.success<null>("Sign-out successful", null);
    } catch (ex) {
      const errorMessage = `Error signing out user with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while signing out.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async loginWithOAuth(provider: OAUTH_PROVIDERS): Promise<
    ServiceResponse<{
      accessToken: string;
      refreshToken: string;
    } | null>
  > {
    try {
      const oauthId = "mock-oauth-id"; // In real implementation, retrieve OAuth ID using the oauthToken
      const user = await userRepositroy.findOne({
        where: { googleId: oauthId },
      });
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      const accessToken = issueAccessToken(user.id ?? 0, user.role);
      const refreshToken = issueRefreshToken(user.id ?? 0, user.role);
      const hashedRefreshToken = await hashToken(refreshToken);
      await userRepositroy.save({
        ...user,
        refreshTokenHash: hashedRefreshToken,
      });
      return ServiceResponse.success<{
        accessToken: string;
        refreshToken: string;
      }>("OAuth login successful", {
        accessToken,
        refreshToken,
      });
    } catch (ex) {
      const errorMessage = `Error logging in with OAuth provider ${provider}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while logging in with OAuth.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validateToken(
    accessToken: string,
    refreshToken: string,
  ): Promise<ServiceResponse<ValidateTokenResponse | null>> {
    try {
      if (accessToken && accessToken.length > 0) {
        const verified = verify(accessToken, env.ACCESSTOKEN_SECRET) as any;
        if (!verified || !verified.userId || verified.userId <= 0) {
          return ServiceResponse.failure(
            "Invalid or expired access token",
            null,
            StatusCodes.UNAUTHORIZED,
          );
        }

        const userId = verified.userId;
        const user = await userRepositroy.findOne({ where: { id: userId } });
        if (!user) {
          return ServiceResponse.failure(
            "User not found",
            null,
            StatusCodes.NOT_FOUND,
          );
        }
        const refreshToken = issueRefreshToken(user.id ?? 0, user.role);
        user.refreshTokenHash = await hashToken(refreshToken);
        await userRepositroy.save(user);

        return ServiceResponse.success<ValidateTokenResponse>(
          "Access token is valid",
          {
            id: user.id ?? 0,
            code: user.code,
            displayName: user.displayName ?? undefined,
            state: user.state,
            role: user.role,
            accessToken: accessToken,
            refreshToken: refreshToken,
          },
        );
      }
      if (refreshToken && refreshToken.length > 0) {
        const verified = verify(refreshToken, env.REFRESHTOKEN_SECRET) as any;
        if (!verified || !verified.userId || verified.userId <= 0) {
          return ServiceResponse.failure(
            "Invalid or expired refresh token",
            null,
            StatusCodes.UNAUTHORIZED,
          );
        }

        const userId = verified.userId;
        const user = await userRepositroy.findOne({ where: { id: userId } });
        if (!user) {
          return ServiceResponse.failure(
            "User not found",
            null,
            StatusCodes.NOT_FOUND,
          );
        }

        const isValid = await compareToken(
          refreshToken,
          user.refreshTokenHash!, // In real implementation, retrieve stored hashed refresh token
        );
        if (!isValid) {
          return ServiceResponse.failure(
            "Refresh token does not match",
            null,
            StatusCodes.UNAUTHORIZED,
          );
        }

        const newAccessToken = issueAccessToken(user.id ?? 0, user.role);
        const newRefreshToken = issueRefreshToken(user.id ?? 0, user.role);
        user.refreshTokenHash = await hashToken(newRefreshToken);
        await userRepositroy.save(user);
        return ServiceResponse.success<ValidateTokenResponse>(
          "Refresh token is valid",
          {
            id: user.id,
            code: user.code,
            displayName: user.displayName ?? undefined,
            state: user.state,
            role: user.role,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
        );
      }
      return ServiceResponse.failure(
        "Invalid Tokens",
        null,
        StatusCodes.UNAUTHORIZED,
      );
    } catch (ex) {
      const errorMessage = `Error validating access token: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while validating access token.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
export const userService = new UserService();
