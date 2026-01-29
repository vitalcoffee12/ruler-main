import AppDataSource from "@/dataSource";
import { GuildEntity } from "@/entities/guildEntity";

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
    await this.entityManager.save(GuildEntity, newGuild);
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
}
