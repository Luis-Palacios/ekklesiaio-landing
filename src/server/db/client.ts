import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let instance: ReturnType<typeof create> | undefined;

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return drizzle({ client: neon(url), schema });
}

// Created on first use, so builds and pages that never touch the DB don't need DATABASE_URL.
export function getDb() {
  instance ??= create();
  return instance;
}
