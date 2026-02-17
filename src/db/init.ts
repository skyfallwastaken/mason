import { migrate } from "drizzle-orm/postgres-js/migrator";

import type { Database } from "./client";

export async function ensureSchema(db: Database): Promise<void> {
  await migrate(db, { migrationsFolder: "./drizzle" });
}
