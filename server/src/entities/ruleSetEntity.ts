import { RuleSet } from "@/api/game/gameModel";
import { User } from "@/api/user/userModel";
import { COMMON_STATE } from "@/common/constants";
import {
  BaseEntity,
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "rule_sets" })
export class RuleSetEntity extends BaseEntity implements RuleSet {
  @PrimaryGeneratedColumn({
    type: "int",
    unsigned: true,
    comment: "Rule Set ID",
  })
  id: number;

  @Column({ type: "varchar", length: 255, nullable: true, unique: true })
  code: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({
    type: "datetime",

    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  constructor(obj: Partial<RuleSetEntity>) {
    super();
    Object.assign(this, obj);
  }

  static fromModel(ruleSet: RuleSet): RuleSetEntity {
    return new RuleSetEntity({
      id: ruleSet.id,
      name: ruleSet.name,
      description: ruleSet.description,
      createdAt: ruleSet.createdAt,
      updatedAt: ruleSet.updatedAt,
    });
  }
}
