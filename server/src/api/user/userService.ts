import { StatusCodes } from "http-status-codes";
import { verify } from "jsonwebtoken";
import type { User } from "@/api/user/userModel";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { env } from "@/common/utils/envConfig";
import {
  comparePass,
  hashToken,
  issueAccessToken,
  issueRefreshToken,
} from "@/common/utils/auth";
import { OAUTH_PROVIDERS } from "@/common/constants";

export class UserService {
  private userRepository: UserRepository;

  constructor(repository: UserRepository = new UserRepository()) {
    this.userRepository = repository;
  }

  // Retrieves all users from the database
  async findAll(): Promise<ServiceResponse<User[] | null>> {
    try {
      const users = await this.userRepository.findAll();
      if (!users || users.length === 0) {
        return ServiceResponse.failure(
          "No Users found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<User[]>("Users found", users);
    } catch (ex) {
      const errorMessage = `Error finding all users: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving users.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Retrieves a single user by their ID
  async findById(id: number): Promise<ServiceResponse<User | null>> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND
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
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(email);
    return !!user;
  }

  async create(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<ServiceResponse<User | null>> {
    try {
      const newUser = await this.userRepository.create({
        name: userData.name,
        email: userData.email,
        passwordHash: userData.password, // In real implementation, hash the password
      });
      return ServiceResponse.success<User>(
        "User created successfully",
        newUser,
        StatusCodes.CREATED
      );
    } catch (ex) {
      const errorMessage = `Error creating user: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while creating user.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async verifyEmail(verificationToken: string): Promise<ServiceResponse<null>> {
    if (!verificationToken || verificationToken.length === 0) {
      return ServiceResponse.failure(
        "Invalid verification token",
        null,
        StatusCodes.BAD_REQUEST
      );
    }
    const verified = verify(verificationToken, env.EMAILTOKEN_SECRET);
    if (!verified) {
      return ServiceResponse.failure(
        "Invalid or expired verification token",
        null,
        StatusCodes.UNAUTHORIZED
      );
    }
    const userId = (verified as any).userId;
    if (verified && userId && userId > 0) {
      const success = await this.userRepository.activate(userId);
      if (!success) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
    }

    // Placeholder implementation
    return ServiceResponse.success<null>("Email verified successfully", null);
  }

  async disable(id: number): Promise<ServiceResponse<null>> {
    try {
      const success = await this.userRepository.disable(id);
      if (!success) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND
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
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async block(id: number, blockedUntil: Date): Promise<ServiceResponse<null>> {
    try {
      const success = await this.userRepository.block(id, blockedUntil);
      if (!success) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND
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
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async changePassword(
    id: number,
    oldPassword: string,
    newPassword: string
  ): Promise<ServiceResponse<null>> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      // In real implementation, verify oldPassword with stored passwordHash
      const checkOldPassword = oldPassword === user.passwordHash;
      if (!checkOldPassword) {
        return ServiceResponse.failure(
          "Old password is incorrect",
          null,
          StatusCodes.UNAUTHORIZED
        );
      }

      const success = await this.userRepository.updatePassword(id, newPassword); // Hash newPassword in real implementation

      if (!success) {
        return ServiceResponse.failure(
          "Failed to update password",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      return ServiceResponse.success<null>(
        "Password changed successfully",
        null
      );
    } catch (ex) {
      const errorMessage = `Error changing password for user with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while changing password.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAccountByEmail(
    email: string
  ): Promise<ServiceResponse<User | null>> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND
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
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async resetPassword(
    id: number,
    newPassword: string,
    resetToken: string
  ): Promise<ServiceResponse<null>> {
    try {
      const success = await this.userRepository.updatePassword(id, newPassword); // Hash newPassword in real implementation

      if (!success) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<null>("Password reset successfully", null);
    } catch (ex) {
      const errorMessage = `Error resetting password for user with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while resetting password.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async refreshToken(
    id: number,
    refreshToken: string
  ): Promise<ServiceResponse<null>> {
    try {
      const success = await this.userRepository.updateRefreshToken(
        id,
        refreshToken
      ); // Hash refreshToken in real implementation

      if (!success) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<null>(
        "Refresh token updated successfully",
        null
      );
    } catch (ex) {
      const errorMessage = `Error updating refresh token for user with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while updating refresh token.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async signIn(
    email: string,
    password: string
  ): Promise<
    ServiceResponse<{
      accessToken: string;
      refreshToken: string;
    } | null>
  > {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      // In real implementation, verify password with stored passwordHash
      const checkPassword = await comparePass(password, user.passwordHash);
      if (!checkPassword) {
        return ServiceResponse.failure(
          "Password is incorrect",
          null,
          StatusCodes.UNAUTHORIZED
        );
      }

      const accessToken = issueAccessToken(user.id ?? 0, user.role);
      const refreshToken = issueRefreshToken(user.id ?? 0, user.role);
      const hashedRefreshToken = await hashToken(refreshToken);
      await this.userRepository.signIn(user.id ?? 0, hashedRefreshToken);

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
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async signOut(id: number): Promise<ServiceResponse<null>> {
    try {
      if (!id || id <= 0) {
        return ServiceResponse.failure(
          "Invalid user ID",
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      const success = await this.userRepository.updateRefreshToken(id, "");
      if (!success) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<null>("Sign-out successful", null);
    } catch (ex) {
      const errorMessage = `Error signing out user with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while signing out.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
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
      const user = await this.userRepository.findByOAuthId(provider, oauthId);
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      const accessToken = issueAccessToken(user.id ?? 0, user.role);
      const refreshToken = issueRefreshToken(user.id ?? 0, user.role);
      const hashedRefreshToken = await hashToken(refreshToken);
      await this.userRepository.signIn(user.id ?? 0, hashedRefreshToken);
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
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}
export const userService = new UserService();
