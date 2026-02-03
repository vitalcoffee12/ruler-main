import AppDataSource from "@/dataSource";
import { GuildEntity } from "@/entities/guildEntity";
import { GuildMember } from "./guildModel";
import { GuildMemberEntity } from "@/entities/guilldMemberEntity";
import { UserEntity } from "@/entities/userEntity";

export class GuildRepository {
  private entityManager;

  constructor() {
    this.entityManager = AppDataSource.manager;
  }

  async findAll(): Promise<GuildEntity[]> {
    const guilds = await this.entityManager.find(GuildEntity);
    return guilds;
  }

  async findById(id: number): Promise<GuildEntity | null> {
    const guild = await this.entityManager.findOne(GuildEntity, {
      where: { id },
    });
    return guild || null;
  }

  async findByCode(code: string): Promise<GuildEntity | null> {
    const guild = await this.entityManager.findOne(GuildEntity, {
      where: { code },
    });
    return guild || null;
  }

  async findByOwnerId(ownerId: number): Promise<GuildEntity[]> {
    const guilds = await this.entityManager.find(GuildEntity, {
      where: { ownerId },
    });
    return guilds;
  }

  async findByMemberUser(user: {
    userId?: number;
    userCode?: string;
  }): Promise<GuildEntity[]> {
    if (!user.userId && !user.userCode) {
      return [];
    }

    if (user.userCode && !user.userId) {
      const guildsByUserCode = await this.entityManager
        .createQueryBuilder(GuildEntity, "guild")
        .innerJoin("guild_members", "member", "member.guildId = guild.id")
        .where("member.userCode = :userCode", { userCode: user.userCode })
        .getMany();
      return guildsByUserCode;
    } else if (!user.userCode && user.userId) {
      const guildsByUserId = await this.entityManager
        .createQueryBuilder(GuildEntity, "guild")
        .innerJoin("guild_members", "member", "member.guildId = guild.id")
        .where("member.userId = :userId", { userId: user.userId })
        .getMany();
      return guildsByUserId;
    }
    const guilds = await this.entityManager
      .createQueryBuilder(GuildEntity, "guild")
      .innerJoin("guild_members", "member", "member.guildId = guild.id")
      .where("member.userId = :userId OR member.userCode = :userCode", {
        userId: user.userId,
        userCode: user.userCode,
      })
      .getMany();
    return guilds;
  }

  async create(guildData: {
    code: string;
    ownerId: number;
    name: string;
    description?: string;
    iconPath?: string;
  }): Promise<GuildEntity> {
    const newGuild = new GuildEntity({
      code: guildData.code,
      ownerId: guildData.ownerId,
      name: guildData.name,
      description: guildData.description,
      state: "active",
      iconPath: guildData.iconPath,
    });
    const user = await this.entityManager.findOne(UserEntity, {
      where: { id: guildData.ownerId },
    });
    await this.entityManager.transaction(async (t) => {
      await t.save(GuildEntity, newGuild);
      await t.save(GuildMemberEntity, {
        guildId: newGuild.id,
        guildCode: newGuild.code,
        userId: guildData.ownerId,
        userCode: user?.code, // Assuming userCode is not available at this point
        role: "owner",
        joinedAt: new Date(),
      });
    });

    return newGuild;
  }

  async activate(code: string): Promise<boolean> {
    const guild = await this.findByCode(code);
    if (guild) {
      guild.state = "active";
      await this.entityManager.save(GuildEntity, guild);
      return true;
    }
    return false;
  }
  async disable(code: string): Promise<boolean> {
    const guild = await this.findByCode(code);
    if (guild) {
      guild.state = "disabled";
      await this.entityManager.save(GuildEntity, guild);
      return true;
    }
    return false;
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
