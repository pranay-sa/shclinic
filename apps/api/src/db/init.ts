import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { db } from "../db.js";

async function run() {
  const schemaSql = await readFile(join(process.cwd(), "src", "sql", "schema.sql"), "utf8");
  const seedSql = await readFile(join(process.cwd(), "src", "sql", "seed.sql"), "utf8");
  await db.query(schemaSql);
  await db.query(seedSql);
  await db.end();
  console.log("Database initialized successfully.");
}

run().catch(async (error) => {
  console.error("Failed to initialize database:", error);
  await db.end();
  process.exit(1);
});
