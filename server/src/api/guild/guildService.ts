import { ServiceResponse } from "@/common/models/serviceResponse";
import { GuildRepository } from "./guildRepository";
import type { Guild, GuildMemberWithUser } from "./guildModel";
import { StatusCodes } from "http-status-codes";
import { GenerateGuildCode } from "../utils";
import { GuildMemberEntity } from "@/entities/guilldMemberEntity";
import { GameRepository } from "../game/gameRepository";
import { Entity, GameHistory, SceneHistory } from "../game/gameModel";
import { User } from "../user/userModel";

export class GuildService {
  constructor(
    private readonly guildRepository: GuildRepository = new GuildRepository(),
    private readonly gameRepository: GameRepository = new GameRepository(),
  ) {}

  async findAll(): Promise<ServiceResponse<Guild[] | null>> {
    try {
      const guilds = await this.guildRepository.findAll();
      if (!guilds || guilds.length === 0) {
        return ServiceResponse.failure(
          "No guilds found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<Guild[]>(
        "Guilds retrieved successfully",
        guilds,
      );
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error retrieving guilds: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByCode(code: string): Promise<
    ServiceResponse<{
      guild: Guild;
      members: any[];
    } | null>
  > {
    try {
      const guild = await this.guildRepository.findByCode(code);
      const members = await this.guildRepository.findMembersByGuild({
        guildCode: code,
      });

      if (!guild) {
        return ServiceResponse.failure(
          "Guild not found",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<{
        guild: Guild;
        members: any[];
      }>("Guild retrieved successfully", {
        guild,
        members,
      });
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error retrieving guild: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getHistoryByCode(
    guildCode: string,
    sceneId: number = 0,
  ): Promise<
    ServiceResponse<{
      sceneHistories: SceneHistory[];
      gameHistories: GameHistory[];
      world: Entity[];
    } | null>
  > {
    try {
      const historyData = await this.gameRepository.getWorld(
        guildCode,
        sceneId,
      );
      if (!historyData) {
        return ServiceResponse.failure(
          "No history found for guild",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<{
        sceneHistories: SceneHistory[];
        gameHistories: GameHistory[];
        world: Entity[];
      }>("History retrieved successfully", historyData);
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error retrieving history for guild: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createGuild(createGuildData: {
    iconPath?: string;
    name: string;
    description?: string;
    ownerId: number;
  }) {
    try {
      const guildCode = GenerateGuildCode();
      const guild = await this.guildRepository.create({
        code: guildCode,
        ownerId: createGuildData.ownerId,
        name: createGuildData.name,
        description: createGuildData.description,
        iconPath: createGuildData.iconPath,
      });
      return ServiceResponse.success<Guild>(
        "Guild created successfully",
        guild,
        StatusCodes.CREATED,
      );
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error creating guild: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findGuildsByUser(user: {
    userId?: number;
    userCode?: string;
  }): Promise<ServiceResponse<Guild[] | null>> {
    try {
      console.log(user);
      const guilds = await this.guildRepository.findGuildByMemberUser(user);
      if (!guilds || guilds.length === 0) {
        return ServiceResponse.failure(
          "No guilds found for user",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<Guild[]>(
        "Guilds retrieved successfully",
        guilds,
      );
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error retrieving guilds for user: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findMembersByGuild(guild: {
    guildId?: number;
    guildCode?: string;
  }): Promise<ServiceResponse<GuildMemberWithUser[] | null>> {
    try {
      const members = await this.guildRepository.findMembersByGuild(guild);
      console.log(members);
      if (!members || members.length === 0) {
        return ServiceResponse.failure(
          "No members found for guild",
          [],
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success<GuildMemberWithUser[]>(
        "Members retrieved successfully",
        members,
      );
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error retrieving members for guild: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async joinUserToGuild(
    guild: { guildId?: number; guildCode?: string },
    users: { userId?: number; userCode?: string; role: string }[],
  ): Promise<ServiceResponse<null>> {
    try {
      const success = await this.guildRepository.joinUsersToGuild(guild, users);
      if (!success) {
        return ServiceResponse.failure(
          "Failed to add user to guild",
          null,
          StatusCodes.BAD_REQUEST,
        );
      }
      return ServiceResponse.success<null>(
        "User(s) added to guild successfully",
        null,
      );
    } catch (ex) {
      const errorMessage = ex instanceof Error ? ex.message : "Unknown error";
      return ServiceResponse.failure(
        `Error adding user to guild: ${errorMessage}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
