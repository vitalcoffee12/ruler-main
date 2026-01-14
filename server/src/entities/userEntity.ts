import { User } from "@/api/user/userModel";
import { COMMON_STATE } from "@/common/constants";
import {
  BaseEntity,
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "users" })
export class UserEntity extends BaseEntity implements User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ unique: true, type: "varchar", length: 100 })
  email: string;

  @Column({ default: "pending", type: "varchar", length: 20 })
  state: "pending" | "active" | "disabled";

  @Column({ default: "user", type: "varchar", length: 20 })
  role: "user" | "admin";

  @Column({ type: "varchar", length: 255 })
  passwordHash: string;

  @Column({ nullable: true, type: "varchar", length: 100 })
  googleId?: string;

  @Column({ nullable: true, type: "varchar", length: 100 })
  githubId?: string;

  @Column({ nullable: true, type: "varchar", length: 100 })
  kakaoId?: string;

  @Column({ nullable: true, type: "varchar", length: 100 })
  naverId?: string;

  @Column({ nullable: true, type: "varchar", length: 255 })
  refreshTokenHash?: string;

  @Column({ type: "datetime", nullable: true })
  blockedUntil?: Date;

  @Column({ type: "datetime", nullable: true })
  lastSigninAt?: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "datetime", nullable: true })
  verifiedAt?: Date;

  @Column({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  constructor(obj: Partial<UserEntity>) {
    super();
    Object.assign(this, obj);
  }

  static fromModel(user: User): UserEntity {
    return new UserEntity({
      id: user.id,
      name: user.name,
      email: user.email,
      state: user.state,
      passwordHash: user.passwordHash,
      refreshTokenHash: user.refreshTokenHash,
      blockedUntil: user.blockedUntil,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  public expireRefreshToken() {
    this.refreshTokenHash = undefined;
  }

  public activeUser() {
    this.state = "active";
  }

  public disableUser() {
    this.state = "disabled";
  }
}
