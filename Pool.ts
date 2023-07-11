import { Pool } from "pg";

export const pool = new Pool({
  user: process.env.POSTGRES_USER || "root",
  host: "localhost",
  database: "postgres",
  password: process.env.POSTGRES_PW || "password",
  port: 5432,
});
