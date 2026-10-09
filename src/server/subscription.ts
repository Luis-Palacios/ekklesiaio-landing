import "server-only";
import { hashToken, isToken } from "./tokens";
import {
  confirmPending,
  findByConfirmHash,
  findStatusByUnsubscribeToken,
  unsubscribeByToken,
} from "./waitlist-repo";

/** Confirm links expire 72 hours after the email went out (docs/DESIGN.md §5.4). */
export const CONFIRM_TTL_MS = 72 * 60 * 60 * 1000;

/**
 * Confirms the signup behind a confirm link. Returns true if it's confirmed now,
 * including when it already was: mail scanners often open the link before the
 * person does, and their click should still say "confirmed".
 */
export async function confirmSubscription(token: unknown, now = new Date()): Promise<boolean> {
  if (!isToken(token)) return false;
  const confirmTokenHash = hashToken(token);

  const confirmed = await confirmPending({
    confirmTokenHash,
    sentAfter: new Date(now.getTime() - CONFIRM_TTL_MS),
    now,
  });
  if (confirmed) return true;

  return (await findByConfirmHash(confirmTokenHash))?.status === "confirmed";
}

/**
 * Read-only check for the confirm page: "valid" if the link can still confirm,
 * "done" if it's already confirmed, "invalid" if it's unknown or expired.
 */
export async function checkConfirmToken(
  token: unknown,
  now = new Date(),
): Promise<"valid" | "done" | "invalid"> {
  if (!isToken(token)) return "invalid";
  const signup = await findByConfirmHash(hashToken(token));
  if (signup?.status === "confirmed") return "done";
  if (signup?.status !== "pending" || !signup.confirmSentAt) return "invalid";
  return signup.confirmSentAt.getTime() > now.getTime() - CONFIRM_TTL_MS ? "valid" : "invalid";
}

/** "valid" if the unsubscribe link belongs to a signup, "done" if it's already unsubscribed. */
export async function checkUnsubscribeToken(token: unknown): Promise<"valid" | "done" | "invalid"> {
  if (!isToken(token)) return "invalid";
  const status = await findStatusByUnsubscribeToken(token);
  if (!status) return "invalid";
  return status === "unsubscribed" ? "done" : "valid";
}

/** Unsubscribes the signup behind an unsubscribe link. Returns false for an unknown token. */
export async function unsubscribe(token: unknown, now = new Date()): Promise<boolean> {
  if (!isToken(token)) return false;
  return unsubscribeByToken(token, now);
}
