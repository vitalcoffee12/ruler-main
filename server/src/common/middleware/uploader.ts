import { generateRandomCode } from "@/api/utils";
import { readdirSync, readFileSync } from "fs";
import multer from "multer";
import path from "path";

export const uploader = (dir: string, limitMB: number) =>
  multer({
    storage: multer.diskStorage({
      destination(req, file, done) {
        try {
          readdirSync(`${process.cwd()}/uploads/${dir}`);
          done(null, `${process.cwd()}/uploads/${dir}`);
        } catch (ex) {
          console.log(ex);
        }
      },
      filename(req, file, done) {
        try {
          const userCode =
            req.headers["userCode"] || `${generateRandomCode(4)}`;
          const ext = path.extname(file.originalname);
          done(null, `${userCode}_${Date.now()}${ext}`);
        } catch (ex) {
          console.log(ex);
        }
      },
    }),
    limits: {
      fileSize: 1024 * 1024 * limitMB,
    },
  });
