import { ServiceResponse } from "@/common/models/serviceResponse";
import type { Guild, GuildMemberWithUser } from "./guildModel";
import { StatusCodes } from "http-status-codes";
import { GenerateGuildCode, GenerateRandomColorCode } from "../utils";
import {
  GuildMemberEntity,
  guildMemberRepository,
} from "@/entities/guilldMemberEntity";
import { Entity, GameHistory, SceneHistory } from "../game/gameModel";
import { GuildEntity, guildRepository } from "@/entities/guildEntity";
import { gameLib } from "../_lib/game.lib";
import { userRepository } from "@/entities/userEntity";
import { COLLECTION_SUFFIX } from "../constants";
import mongoose from "mongoose";

export class GuildService {
  async findAll(): Promise<ServiceResponse<Guild[] | null>> {
    try {
      const guilds = await guildRepository.find();
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
      const guild = await guildRepository.findOne({ where: { code } });
      const members = await guildMemberRepository.find({
        where: { guildCode: code },
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
      const historyData = await gameLib.getWorld(guildCode, sceneId);
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

  async createWithCollections(guildData: {
    code: string;
    ownerId: number;
    name: string;
    description?: string;
    iconPath?: string;
  }): Promise<GuildEntity> {
    const newGuild = new GuildEntity({
      code: guildData.code,
      colorCode: GenerateRandomColorCode(),
      ownerId: guildData.ownerId,
      name: guildData.name,
      description: guildData.description,
      state: "active",
      iconPath: guildData.iconPath,
    });
    const user = await userRepository.findOne({
      where: { id: guildData.ownerId },
    });
    if (!user) {
      throw new Error(`User with ID ${guildData.ownerId} not found`);
    }

    await guildRepository.save(newGuild);
    await guildMemberRepository.save(
      new GuildMemberEntity({
        guildId: newGuild.id,
        guildCode: newGuild.code,
        userId: guildData.ownerId,
        userCode: user.code, // Assuming userCode is not available at this point
        role: "owner",
        joinedAt: new Date(),
      }),
    );

    mongoose.connection.createCollection(
      `${newGuild.code}.${COLLECTION_SUFFIX.GAME_HISTORY}`,
    );
    mongoose.connection.createCollection(
      `${newGuild.code}.${COLLECTION_SUFFIX.SCENE_HISTORY}`,
    );
    mongoose.connection.createCollection(
      `${newGuild.code}.${COLLECTION_SUFFIX.RULE_SET}`,
    );
    mongoose.connection.createCollection(
      `${newGuild.code}.${COLLECTION_SUFFIX.TERM_SET}`,
    );

    return newGuild;
  }

  async createGuild(createGuildData: {
    iconPath?: string;
    name: string;
    description?: string;
    ownerId: number;
  }) {
    try {
      const guildCode = GenerateGuildCode();
      const guild = await guildRepository.create({
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
      const guildMember = await guildMemberRepository.find({
        where: { userId: user.userId, userCode: user.userCode },
      });
      const guilds = await guildRepository.find({
        where: guildMember.map((gm) => ({ id: gm.guildId })),
      });
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
      const members = await guildMemberRepository.find({
        where: { guildId: guild.guildId, guildCode: guild.guildCode },
      });
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
      const success = await guildMemberRepository.joinUsersToGuild(
        guild,
        users,
      );
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

  async updateRefreshToken(
    id: number,
    refreshTokenHash: string,
  ): Promise<boolean> {
    const user = await this.findById(id);
    if (user) {
      user.refreshTokenHash = refreshTokenHash;
      await this.entityManager.save(UserEntity, user);
      return true;
    }
    return false;
  }

  async signIn(id: number, refreshTokenHash: string): Promise<void> {
    const user = await this.findById(id);
    if (user) {
      user.lastSigninAt = new Date();
      await this.entityManager.save(UserEntity, user);
    }
  }

  async findByOAuthId(
    provider: OAUTH_PROVIDERS,
    oauthId: string,
  ): Promise<UserEntity | null> {
    let user: UserEntity | null = null;
    if (provider === OAUTH_PROVIDERS.GOOGLE) {
      user = await this.entityManager.findOne(UserEntity, {
        where: { googleId: oauthId },
      });
    } else if (provider === OAUTH_PROVIDERS.GITHUB) {
      user = await this.entityManager.findOne(UserEntity, {
        where: { githubId: oauthId },
      });
    } else if (provider === OAUTH_PROVIDERS.KAKAO) {
      user = await this.entityManager.findOne(UserEntity, {
        where: { kakaoId: oauthId },
      });
    } else if (provider === OAUTH_PROVIDERS.NAVER) {
      user = await this.entityManager.findOne(UserEntity, {
        where: { naverId: oauthId },
      });
    }
    return user || null;
  }

  async updateOAuthId(
    id: number,
    provider: OAUTH_PROVIDERS,
    oauthId: string,
  ): Promise<boolean> {
    const user = await this.findById(id);
    if (user) {
      if (provider === "google") {
        user.googleId = oauthId;
      } else if (provider === "kakao") {
        user.kakaoId = oauthId;
      } else if (provider === "naver") {
        user.naverId = oauthId;
      }
      await this.entityManager.save(UserEntity, user);
      return true;
    }
    return false;
  }

  async findMembersByGuild(guild: {
    guildId?: number;
    guildCode?: string;
  }): Promise<GuildMemberWithUser[]> {
    let members = [];
    const selects = [
      "user.id AS user_id",
      "user.code AS user_code",
      "user.iconPath AS user_iconPath",
      "user.displayName AS user_displayName",
      "member.iconPath AS member_iconPath",
      "member.displayName AS member_displayName",
      "member.id AS member_id",
      "member.role AS member_role",
      "member.joinedAt AS member_joinedAt",
    ];
    if (guild.guildId) {
      const membersById = await this.createQueryBuilder(UserEntity, "user")
        .innerJoin(GuildMemberEntity, "member", "member.userId = user.id")
        .where("member.guildId = :guildId", { guildId: guild.guildId })
        .select(selects)
        .getRawMany();
      members = membersById;
    }
    if (guild.guildCode) {
      const membersByCode = await this.createQueryBuilder(UserEntity, "user")
        .innerJoin(GuildMemberEntity, "member", "member.userId = user.id")
        .where("member.guildCode = :guildCode", { guildCode: guild.guildCode })
        .select(selects)
        .getRawMany();
      members = membersByCode;
    }

    return members.map((m) => ({
      id: m.member_id,
      userId: m.user_id,
      userCode: m.user_code,
      guildId: guild.guildId ? guild.guildId : 0,
      guildCode: guild.guildCode ? guild.guildCode : "",
      iconPath: m.member_iconPath ? m.member_iconPath : m.user_iconPath,
      displayName: m.member_displayName
        ? m.member_displayName
        : m.user_displayName,
      role: m.member_role,
      joinedAt: m.member_joinedAt,
    }));
  }

  async findGuildByMemberUser(user: {
    userId?: number;
    userCode?: string;
  }): Promise<GuildEntity[]> {
    if (!user.userId && !user.userCode) {
      return [];
    }

    if (user.userCode && !user.userId) {
      const guildsByUserCode = await this.createQueryBuilder("guild")
        .innerJoin("guild_members", "member", "member.guildId = guild.id")
        .where("member.userCode = :userCode", { userCode: user.userCode })
        .getMany();
      return guildsByUserCode;
    } else if (!user.userCode && user.userId) {
      const guildsByUserId = await this.createQueryBuilder("guild")
        .innerJoin("guild_members", "member", "member.guildId = guild.id")
        .where("member.userId = :userId", { userId: user.userId })
        .getMany();
      return guildsByUserId;
    }
    const guilds = await this.createQueryBuilder("guild")
      .innerJoin("guild_members", "member", "member.guildId = guild.id")
      .where("member.userId = :userId OR member.userCode = :userCode", {
        userId: user.userId,
        userCode: user.userCode,
      })
      .getMany();
    return guilds;
  }

  async joinUsersToGuild(
    guild: { guildId?: number; guildCode?: string },
    users: { userId?: number; userCode?: string; role: string }[],
  ): Promise<boolean> {
    let guildEntity = null;
    let userEntities = [];
    if (guild.guildId) {
      guildEntity = await this.findById(guild.guildId);
    } else if (guild.guildCode) {
      guildEntity = await this.findByCode(guild.guildCode);
    }
    if (!guildEntity) {
      return false;
    }

    userEntities = await this.entityManager
      .createQueryBuilder("user", "user")
      .where("user.id IN (:...userIds) OR user.code IN (:...userCodes)", {
        userIds: users
          .filter((u) => u.userId !== undefined)
          .map((u) => u.userId) as number[],
        userCodes: users
          .filter((u) => u.userCode !== undefined)
          .map((u) => u.userCode) as string[],
      })
      .getMany();

    const members: GuildMember[] = [];
    for (const userEntity of userEntities) {
      members.push({
        guildId: guildEntity.id,
        guildCode: guildEntity.code,
        userId: userEntity.id,
        userCode: userEntity.code,
        role: users.find(
          (u) =>
            (u.userId && u.userId === userEntity.id) ||
            (u.userCode && u.userCode === userEntity.code),
        )?.role as string,
        joinedAt: new Date(),
      });
    }

    await this.entityManager
      .createQueryBuilder()
      .insert()
      .into("guild_members")
      .values(members)
      .execute();

    return true;
  }
}
