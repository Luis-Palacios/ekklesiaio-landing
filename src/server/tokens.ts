import { createHash, randomBytes } from "node:crypto";

/** 32 random bytes, URL-safe. Used for confirm and unsubscribe tokens. */
export function createToken(): string {
  return randomBytes(32).toString("base64url");
}

/** True for strings shaped like createToken() output; anything else skips the DB lookup. */
export function isToken(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
}

/** The confirm token is stored only as this hash (hex SHA-256). */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
