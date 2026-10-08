// Applies pending Drizzle migrations from ./drizzle during Vercel builds (see the
// "vercel-build" script and docs/DESIGN.md §5.5). Runs only for VERCEL_ENV production
// or preview; locally, use `npm run db:migrate` (drizzle-kit). Exits non-zero on
// failure, which stops the deploy.
import { readFileSync } from "node:fs";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

const MIGRATIONS_FOLDER = "./drizzle";

const vercelEnv = process.env.VERCEL_ENV;
if (vercelEnv !== "production" && vercelEnv !== "preview") {
  console.log(`[migrate] skipped (VERCEL_ENV=${vercelEnv || "unset"})`);
  process.exit(0);
}

// DDL goes over a direct connection, not through Neon's PgBouncer pooler.
const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("[migrate] neither DATABASE_URL_UNPOOLED nor DATABASE_URL is set");
  process.exit(1);
}
const source = process.env.DATABASE_URL_UNPOOLED ? "DATABASE_URL_UNPOOLED" : "DATABASE_URL";

const journal = JSON.parse(readFileSync(`${MIGRATIONS_FOLDER}/meta/_journal.json`, "utf8")) as {
  entries: { when: number; tag: string }[];
};

// Node 22+ has a global WebSocket, so the Neon driver needs no `ws` package here.
const pool = new Pool({ connectionString, max: 1 });

/** created_at of each applied migration (drizzle stores the migration's folderMillis there). */
async function appliedMigrations(): Promise<Set<number>> {
  try {
    const { rows } = await pool.query<{ created_at: string }>(
      "select created_at from drizzle.__drizzle_migrations",
    );
    return new Set(rows.map((row) => Number(row.created_at)));
  } catch (error) {
    if ((error as { code?: string }).code === "42P01") return new Set(); // first run: no table yet
    throw error;
  }
}

try {
  console.log(`[migrate] VERCEL_ENV=${vercelEnv}, using ${source}`);
  const before = await appliedMigrations();
  await migrate(drizzle({ client: pool }), { migrationsFolder: MIGRATIONS_FOLDER });
  const after = await appliedMigrations();

  const ran = [...after]
    .filter((when) => !before.has(when))
    .sort((a, b) => a - b)
    .map(
      (when) => journal.entries.find((entry) => entry.when === when)?.tag ?? `unknown (${when})`,
    );

  if (ran.length === 0) console.log("[migrate] database is up to date; no migrations ran");
  else console.log(`[migrate] applied ${ran.length}: ${ran.join(", ")}`);
} catch (error) {
  console.error("[migrate] failed:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
