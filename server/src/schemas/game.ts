import { GameHistorySchema, SceneHistorySchema } from "@/api/game/gameModel";
import mongoose from "mongoose";

const { Schema } = mongoose;

export const gameHistorySchema = new Schema(
  {
    ...GameHistorySchema.transform((s) => {
      const obj: any = s;
      delete obj.id;
      delete obj.createdAt;
      return obj;
    }),
  },
  { timestamps: true },
);

export const sceneHistorySchema = new Schema(
  {
    ...SceneHistorySchema.transform((s) => {
      const obj: any = s;
      delete obj.id;
      delete obj.createdAt;
      return obj;
    }),
  },
  { timestamps: true },
);
