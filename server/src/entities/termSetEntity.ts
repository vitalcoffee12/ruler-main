import { RuleSet, TermSet } from "@/api/game/gameModel";
import { User } from "@/api/user/userModel";
import { COMMON_STATE } from "@/common/constants";
import {
  BaseEntity,
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "term_sets" })
export class TermSetEntity extends BaseEntity implements TermSet {
  @PrimaryGeneratedColumn({
    type: "int",
    unsigned: true,
    comment: "Term Set ID",
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

  constructor(obj: Partial<TermSetEntity>) {
    super();
    Object.assign(this, obj);
  }

  static fromModel(termSet: TermSet): TermSetEntity {
    return new TermSetEntity({
      id: termSet.id,
      name: termSet.name,
      description: termSet.description,
      createdAt: termSet.createdAt,
      updatedAt: termSet.updatedAt,
    });
  }
}
