import { defineConfig } from "drizzle-kit";

// drizzle-kit doesn't read Next's env files; load .env.local when it exists.
try {
  process.loadEnvFile(".env.local");
} catch {}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
