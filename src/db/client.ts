import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import type { AppEnv } from "../config/env";
import * as schema from "./schema";

export function createDatabase(env: AppEnv) {
  const sql = postgres(env.DATABASE_URL, {
    max: 10,
    prepare: false,
  });

  const db = drizzle(sql, { schema });
  return { db, sql };
}

export type Database = ReturnType<typeof createDatabase>["db"];
export type SqlClient = ReturnType<typeof createDatabase>["sql"];
