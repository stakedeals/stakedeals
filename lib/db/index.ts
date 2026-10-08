import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var _postgresPool: Pool | undefined;
}

export function createPgPool(): Pool {
  if (!global._postgresPool) {
    // 1. Check Cloud SQL configuration
    if (process.env.SQL_HOST && process.env.SQL_USER) {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    } else if (process.env.DATABASE_URL) {
      // 2. Check connection string (Neon / external PostgreSQL)
      const connectionString = process.env.DATABASE_URL;
      global._postgresPool = new Pool({
        connectionString,
        ssl: connectionString.includes("neon.tech") ? { rejectUnauthorized: false } : undefined,
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    } else {
      // Default local connection
      global._postgresPool = new Pool({
        host: "localhost",
        port: 5432,
        user: "postgres",
        database: "stakedeals",
        max: 5,
        connectionTimeoutMillis: 5000,
      });
    }

    global._postgresPool.on("error", (err) => {
      console.error("[PostgreSQL Pool Error]", err);
    });
  }

  return global._postgresPool;
}

export const pool = createPgPool();
export const db = drizzle(pool, { schema });
export { schema };

export async function closePgPool(): Promise<void> {
  if (global._postgresPool) {
    await global._postgresPool.end();
    global._postgresPool = undefined;
  }
}
