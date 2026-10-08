import "server-only";
import { getSiteUrl } from "@/lib/site-url";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type SiteverifyResponse = {
  success?: boolean;
  hostname?: string;
  "error-codes"?: string[];
};

/**
 * Verifies a Turnstile token with Cloudflare. Fails closed: a missing secret,
 * a missing token or a network error all count as "not verified".
 *
 * In Vercel production, the token must also have been issued on the site's own
 * host. Preview and local use Cloudflare's always-pass test keys, which always report
 * hostname "example.com", so the check is skipped there (and test keys that leak into
 * production get rejected).
 */
export async function verifyTurnstile(token: string | undefined, ip: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("[turnstile] TURNSTILE_SECRET_KEY is not set");
    return false;
  }
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  let data: SiteverifyResponse;
  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
    });
    data = (await res.json()) as SiteverifyResponse;
  } catch (error) {
    console.error("[turnstile] siteverify failed:", error);
    return false;
  }

  if (data.success !== true) {
    console.warn("[turnstile] rejected:", data["error-codes"]);
    return false;
  }

  if (process.env.VERCEL_ENV === "production") {
    const expected = getSiteUrl().hostname;
    if (data.hostname !== expected) {
      console.warn(`[turnstile] hostname mismatch: got ${data.hostname}, expected ${expected}`);
      return false;
    }
  }

  return true;
}
