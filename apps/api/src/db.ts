import { Pool, type PoolClient } from "pg";
import { env, isProd } from "./config.js";

export const db = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: isProd ? { rejectUnauthorized: true } : false,
  max: 20,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000
});

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
