import { Guild } from "@/api/guild/guildModel";

import {
  BaseEntity,
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "guilds" })
export class GuildEntity extends BaseEntity implements Guild {
  @PrimaryGeneratedColumn({ type: "int", unsigned: true, comment: "Guild ID" })
  id: number;

  @Column({ type: "varchar", length: 255, nullable: true, unique: true })
  code: string;

  @Column({ type: "int", nullable: false })
  ownerId: number;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  iconPath?: string;

  @Column({ default: "active", type: "varchar", length: 20 })
  state: "active" | "disabled";

  @Column({ type: "boolean", default: false, nullable: false })
  autoFlag: boolean;

  @Column({ type: "int", nullable: false, default: 1 })
  sceneId: number;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  constructor(obj: Partial<GuildEntity>) {
    super();
    Object.assign(this, obj);
  }

  static fromModel(guild: Guild): GuildEntity {
    return new GuildEntity({
      id: guild.id,
      name: guild.name,
      state: guild.state,
      autoFlag: guild.autoFlag,
      createdAt: guild.createdAt,
      updatedAt: guild.updatedAt,
    });
  }

  public activeGuild() {
    this.state = "active";
  }

  public disableGuild() {
    this.state = "disabled";
  }
}
