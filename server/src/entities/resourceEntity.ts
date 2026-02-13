import { Resource } from "@/api/resources/resourceModel";
import AppDataSource from "@/dataSource";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { C } from "vitest/dist/chunks/reporters.d.BFLkQcL6";

@Entity({ name: "resources" })
export class ResourceEntity extends BaseEntity implements Resource {
  @PrimaryGeneratedColumn({
    type: "int",
    unsigned: true,
    comment: "Resource ID",
  })
  id: number;

  @Column({ type: "varchar", length: 255, nullable: true, unique: true })
  code: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "enum", enum: ["ruleSet", "termSet"] })
  type: "ruleSet" | "termSet";

  @Column({ type: "int", nullable: false, default: 0 })
  generativeLevel: number;

  @Column({ type: "text", nullable: true })
  imagePath?: string;

  @Column({ type: "text", nullable: true })
  filePath?: string;

  @Column({ type: "int", unsigned: true })
  ownerId: number;

  @Column({ type: "varchar", length: 50 })
  ownerCode: string;

  @Column({ type: "simple-array", nullable: true })
  distributors: string[];

  @Column({ type: "simple-array", nullable: true })
  tags: string[]; // stringified array

  @Column({ type: "enum", enum: ["public", "private", "unlisted"] })
  visibility: "public" | "private" | "unlisted";

  @Column({ type: "int", unsigned: true, default: 0 })
  downloadCount: number;

  @Column({ type: "int", unsigned: true, default: 0 })
  favoriteCount: number;

  @Column({ type: "float", unsigned: true, default: 0 })
  rating: number;

  @Column({ type: "int", unsigned: true, default: 0 })
  reviews: number;

  @Column({ type: "int", unsigned: true, default: 1 })
  version: number;

  @Column({ type: "datetime", nullable: true })
  verifiedAt: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({
    type: "datetime",

    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  constructor(obj: Partial<ResourceEntity>) {
    super();
    Object.assign(this, obj);
  }

  static fromModel(resource: Resource): ResourceEntity {
    return new ResourceEntity({
      id: resource.id,
      name: resource.name,
      description: resource.description,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    });
  }
}
