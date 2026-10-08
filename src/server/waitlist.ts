import "server-only";
import type { Locale } from "next-intl";
import type { WaitlistSource } from "@/lib/waitlist-schema";
import { sendConfirmationEmail } from "./email/send-confirmation";
import { createToken, hashToken } from "./tokens";
import {
  claimConfirmationSend,
  findSignup,
  insertSignup,
  resetConfirmSentAt,
} from "./waitlist-repo";

export const RESEND_INTERVAL_MS = 10 * 60 * 1000;

type Signup = { email: string; locale: Locale; source: WaitlistSource };

/**
 * Adds or refreshes a waitlist signup (docs/DESIGN.md §5.3). Every outcome looks the
 * same to the caller, so the form can't reveal who is on the list. Throws on DB or
 * send failure.
 *   new          → insert pending + send
 *   pending      → rotate token + resend, at most once per 10 minutes
 *   confirmed    → nothing
 *   unsubscribed → back to pending + send
 */
export async function addToWaitlist({ email, locale, source }: Signup, now = new Date()) {
  let existing = await findSignup(email);

  if (!existing) {
    const confirmToken = createToken();
    const unsubscribeToken = createToken();
    const id = await insertSignup({
      email,
      locale,
      source,
      confirmTokenHash: hashToken(confirmToken),
      confirmSentAt: now,
      unsubscribeToken,
    });
    if (id) {
      await send(id, null, { to: email, locale, confirmToken, unsubscribeToken });
      return;
    }
    // A concurrent submit inserted it first; continue as an existing signup.
    existing = await findSignup(email);
    if (!existing) throw new Error("waitlist signup vanished after insert conflict");
  }

  if (existing.status === "confirmed") return;

  const confirmToken = createToken();
  const claimed = await claimConfirmationSend({
    id: existing.id,
    fromStatus: existing.status,
    sentBefore:
      existing.status === "pending" ? new Date(now.getTime() - RESEND_INTERVAL_MS) : undefined,
    confirmTokenHash: hashToken(confirmToken),
    locale,
    now,
  });
  // Not claimed: throttled, or another request changed the row first. Either way, done.
  if (!claimed) return;

  await send(existing.id, existing.confirmSentAt, {
    to: email,
    locale,
    confirmToken,
    unsubscribeToken: existing.unsubscribeToken,
  });
}

async function send(
  id: string,
  previousSentAt: Date | null,
  email: Parameters<typeof sendConfirmationEmail>[0],
) {
  try {
    await sendConfirmationEmail(email);
  } catch (error) {
    await resetConfirmSentAt(id, previousSentAt).catch(() => {});
    throw error;
  }
}
