import { Guild, GuildResource } from "@/api/guild/guildModel";
import AppDataSource from "@/dataSource";

import {
  BaseEntity,
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "guild_resources" })
export class GuildResourceEntity extends BaseEntity implements GuildResource {
  @PrimaryGeneratedColumn({ type: "int", unsigned: true, comment: "Guild ID" })
  id: number;

  @Column({ type: "int", nullable: false })
  guildId: number;
  @Column({ type: "varchar", length: 255, nullable: true, unique: true })
  guildCode: string;

  @Column({ type: "int", nullable: false })
  resourceId: number;
  @Column({ type: "varchar", length: 255, nullable: true, unique: true })
  resourceCode: string;

  @Column({ type: "enum", enum: ["ruleSet", "termSet"], nullable: false })
  type: "ruleSet" | "termSet";

  @Column({ type: "int", default: 1 })
  version: number;

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

  constructor(obj: Partial<GuildResourceEntity>) {
    super();
    Object.assign(this, obj);
  }

  static fromModel(guildResource: GuildResource): GuildResourceEntity {
    return new GuildResourceEntity({
      id: guildResource.id,
      guildId: guildResource.guildId,
      guildCode: guildResource.guildCode,
      resourceId: guildResource.resourceId,
      resourceCode: guildResource.resourceCode,
      type: guildResource.type,
      version: guildResource.version,
      createdAt: guildResource.createdAt,
      updatedAt: guildResource.updatedAt,
    });
  }
}
