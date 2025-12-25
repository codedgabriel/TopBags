import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// No backend database required for this specific frontend-only app
// providing a dummy connection to satisfy the environment if needed
// but strictly speaking we are using MemStorage and no DB.

const connectionString = process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/db";

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
