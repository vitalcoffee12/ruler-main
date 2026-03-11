import { generateRandomCode } from "@/api/utils";
import { readFileSync } from "fs";
import multer from "multer";
import path from "path";

export const uploader = (dir: string, limitMB: number) =>
  multer({
    storage: multer.diskStorage({
      destination(req, file, done) {
        try {
          readFileSync(`uploads/${dir}`);
          done(null, `uploads/${dir}`);
        } catch (ex) {
          console.log("error no available directory");
        }
      },
      filename(req, file, done) {
        const userCode = req.headers["userCode"] || `${generateRandomCode(4)}`;
        const ext = path.extname(file.originalname);
        done(null, `${userCode}_${Date.now()}${ext}`);
      },
    }),
    limits: {
      fileSize: 1024 * 1024 * limitMB,
    },
  });
