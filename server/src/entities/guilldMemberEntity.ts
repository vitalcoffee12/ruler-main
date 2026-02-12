import { GuildMember } from "@/api/guild/guildModel";
import AppDataSource from "@/dataSource";

import {
  BaseEntity,
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "guild_members" })
export class GuildMemberEntity extends BaseEntity implements GuildMember {
  @PrimaryGeneratedColumn({ type: "int", unsigned: true, comment: "Guild ID" })
  id: number;

  @Column({ type: "int", nullable: false })
  guildId: number;
  @Column({ type: "varchar", length: 255, nullable: false })
  guildCode: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  iconPath?: string;
  @Column({ type: "varchar", length: 255, nullable: true })
  displayName?: string;

  @Column({ type: "int", nullable: false })
  userId: number;
  @Column({ type: "varchar", length: 255, nullable: false })
  userCode: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  role: string;

  @Column({
    type: "datetime",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
  })
  joinedAt: Date;

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

  constructor(obj: Partial<GuildMemberEntity>) {
    super();
    Object.assign(this, obj);
  }

  static fromModel(guildMember: GuildMember): GuildMemberEntity {
    return new GuildMemberEntity({
      id: guildMember.id,
      guildId: guildMember.guildId,
      guildCode: guildMember.guildCode,
      userId: guildMember.userId,
      userCode: guildMember.userCode,
      role: guildMember.role,
    });
  }
}

export const guildMemberRepository =
  AppDataSource.getRepository(GuildMemberEntity);
