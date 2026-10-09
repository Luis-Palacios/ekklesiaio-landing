import { createHash, timingSafeEqual } from "node:crypto";
import { purgeUnconfirmed } from "@/server/retention";

// Daily Vercel Cron (vercel.json). Vercel sends `Authorization: Bearer $CRON_SECRET`;
// without the secret set, every call is refused.

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron] purge-pending: CRON_SECRET is not set");
    return new Response("Unauthorized", { status: 401 });
  }
  if (!matches(request.headers.get("authorization") ?? "", `Bearer ${secret}`)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const deleted = await purgeUnconfirmed();
    console.log(`[cron] purge-pending: deleted ${deleted} unconfirmed signup(s)`);
    return Response.json({ deleted });
  } catch (error) {
    console.error("[cron] purge-pending failed:", error);
    return Response.json({ error: "purge failed" }, { status: 500 });
  }
}

// Constant-time compare; hashing first makes the lengths equal.
function matches(received: string, expected: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(received), digest(expected));
}
