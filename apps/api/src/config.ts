import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().default(4000),
  API_CORS_ORIGIN: z.string().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(16),
  DATABASE_URL: z.string().url()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid API environment: ${parsed.error.message}`);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
