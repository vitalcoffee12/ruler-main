import { env } from "@/common/utils/envConfig";
import { app, logger } from "@/server";
import mongoose from "mongoose";
import "reflect-metadata";

const server = app.listen(env.PORT, () => {
  const {
    NODE_ENV,
    HOST,
    PORT,
    DB_MONGO_URI,
    DB_MONGO_NAME,
    DB_MONGO_USER,
    DB_MONGO_PASS,
  } = env;
  logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);

  mongoose
    .connect(DB_MONGO_URI, {
      dbName: DB_MONGO_NAME,
      user: DB_MONGO_USER,
      pass: DB_MONGO_PASS,
    })
    .then(() => {
      logger.info("Connected to MongoDB");
    });
});

const onCloseSignal = () => {
  logger.info("sigint received, shutting down");
  server.close(() => {
    logger.info("server closed");
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
