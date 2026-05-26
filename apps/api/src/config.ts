import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const apiPort = process.env.API_PORT ?? process.env.PORT ?? "4000";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number(),
  API_CORS_ORIGIN: z.string().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(16),
  DATABASE_URL: z.string().url()
});

const parsed = envSchema.safeParse({
  ...process.env,
  API_PORT: apiPort
});

if (!parsed.success) {
  throw new Error(`Invalid API environment: ${parsed.error.message}`);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
