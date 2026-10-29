import "dotenv/config";
import { Pool } from "pg";

const databaseName =
  process.env.NODE_ENV === "test"
    ? "task_management_test"
    : process.env.DB_NAME;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: databaseName,
});