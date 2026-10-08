"use server";

import { headers } from "next/headers";
import { waitlistSchema, type WaitlistState } from "@/lib/waitlist-schema";
import { checkRateLimit } from "./ratelimit";
import { verifyTurnstile } from "./turnstile";
import { addToWaitlist } from "./waitlist";

export async function joinWaitlist(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const raw = Object.fromEntries(
    ["email", "locale", "source", "company", "cf-turnstile-response"].map((key) => [
      key,
      formData.get(key) ?? undefined,
    ]),
  );
  const parsed = waitlistSchema.safeParse(raw);
  // Echo what was typed so the field keeps it after React resets the form.
  const typed = typeof raw.email === "string" ? raw.email : "";

  if (!parsed.success) {
    // Only the email is user-editable; anything else invalid is a tampered request.
    const emailOnly = parsed.error.issues.every((issue) => issue.path[0] === "email");
    return emailOnly ? { status: "invalid", email: typed } : { status: "error", email: typed };
  }

  const data = parsed.data;
  if (data.company) return { status: "success" };

  const ip = clientIp(await headers());

  try {
    if (!(await verifyTurnstile(data["cf-turnstile-response"], ip))) {
      return { status: "error", email: typed };
    }
    if (!(await checkRateLimit(ip))) return { status: "error", email: typed };

    await addToWaitlist({ email: data.email, locale: data.locale, source: data.source });
  } catch (error) {
    console.error("[waitlist] signup failed:", error);
    return { status: "error", email: typed };
  }

  return { status: "success" };
}

function clientIp(h: Headers): string | null {
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
}
