import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let limiter: Ratelimit | null | undefined;

function getLimiter() {
  if (limiter !== undefined) return limiter;
  // The Vercel Upstash integration sets KV_REST_API_*. Passed explicitly: Upstash's docs only
  // document UPSTASH_REDIS_REST_* for Redis.fromEnv(), which would also take precedence.
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  limiter =
    url && token
      ? new Ratelimit({
          redis: new Redis({ url, token }),
          limiter: Ratelimit.slidingWindow(5, "10 m"),
          prefix: "ratelimit:waitlist",
        })
      : null;
  return limiter;
}

/**
 * 5 waitlist submissions per IP per 10 minutes (docs/DESIGN.md §5.3).
 * Without Upstash config, production fails closed; other environments skip the check.
 */
export async function checkRateLimit(ip: string | null) {
  const rl = getLimiter();
  if (!rl) {
    if (process.env.NODE_ENV === "production") {
      console.error("[ratelimit] Upstash Redis is not configured");
      return false;
    }
    console.warn("[ratelimit] Upstash Redis is not configured; skipping rate limit");
    return true;
  }
  const { success } = await rl.limit(ip ?? "unknown");
  return success;
}
