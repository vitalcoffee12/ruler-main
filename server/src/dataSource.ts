import { env } from "./common/utils/envConfig.js";
import { DataSource } from "typeorm";

const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = env;

const AppDataSource = new DataSource({
  type: "mysql",
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  synchronize: false,
  logging: true,
  entities: ["src/entities/**.ts"],
  subscribers: [],
  migrations: ["src/migrations/**{.ts,.js}"],
});

try {
  AppDataSource.initialize().then(() => {
    console.log("Data Source has been initialized!");
  });
} catch (error) {
  console.error("Error during Data Source initialization:", error);
}

export default AppDataSource;
