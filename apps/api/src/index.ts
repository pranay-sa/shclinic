import { createServer } from "node:http";
import { listenTarget } from "./config.js";
import { db } from "./db.js";
import { app } from "./app.js";
import { setupRealtime } from "./realtime.js";

const httpServer = createServer(app);
setupRealtime(httpServer);

httpServer.listen(listenTarget, () => {
  const host = typeof listenTarget === "number" ? `http://localhost:${listenTarget}` : listenTarget;
  console.log(`API running on ${host}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down API...`);
  await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  await db.end();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
