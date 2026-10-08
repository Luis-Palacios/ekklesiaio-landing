import { createHash, randomBytes } from "node:crypto";

/** 32 random bytes, URL-safe. Used for confirm and unsubscribe tokens. */
export function createToken(): string {
  return randomBytes(32).toString("base64url");
}

/** The confirm token is stored only as this hash (hex SHA-256). */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
