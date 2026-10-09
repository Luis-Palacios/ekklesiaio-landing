import "server-only";
import { and, eq, gt, isNull, lt, or } from "drizzle-orm";
import type { Locale } from "next-intl";
import type { WaitlistSource } from "@/lib/waitlist-schema";
import { getDb } from "./db/client";
import { waitlistSignups, type WaitlistSignup } from "./db/schema";

// Thin data access for the waitlist. Kept separate so the signup rules in
// waitlist.ts can be unit-tested with this module mocked.

export async function findSignup(email: string): Promise<WaitlistSignup | undefined> {
  const [row] = await getDb()
    .select()
    .from(waitlistSignups)
    .where(eq(waitlistSignups.email, email))
    .limit(1);
  return row;
}

/** Inserts a pending signup and returns its id, or null if the email already exists (lost a race). */
export async function insertSignup(values: {
  email: string;
  locale: Locale;
  source: WaitlistSource;
  confirmTokenHash: string;
  confirmSentAt: Date;
  unsubscribeToken: string;
}): Promise<string | null> {
  const [row] = await getDb()
    .insert(waitlistSignups)
    .values({ ...values, status: "pending" })
    .onConflictDoNothing({ target: waitlistSignups.email })
    .returning({ id: waitlistSignups.id });
  return row?.id ?? null;
}

/**
 * Moves a signup to `pending` with a fresh confirm token, but only if it is still
 * in `fromStatus` and (when `sentBefore` is given) the last email went out before it.
 * The condition is in the UPDATE itself, so two concurrent submits can't both send.
 * Returns true if this call claimed the send.
 */
export async function claimConfirmationSend(args: {
  id: string;
  fromStatus: WaitlistSignup["status"];
  sentBefore?: Date;
  confirmTokenHash: string;
  locale: Locale;
  now: Date;
}): Promise<boolean> {
  const t = waitlistSignups;
  const rows = await getDb()
    .update(t)
    .set({
      status: "pending",
      confirmTokenHash: args.confirmTokenHash,
      confirmSentAt: args.now,
      locale: args.locale,
      updatedAt: args.now,
    })
    .where(
      and(
        eq(t.id, args.id),
        eq(t.status, args.fromStatus),
        args.sentBefore
          ? or(isNull(t.confirmSentAt), lt(t.confirmSentAt, args.sentBefore))
          : undefined,
      ),
    )
    .returning({ id: t.id });
  return rows.length > 0;
}

/** Undoes the send timestamp after a failed send, so a retry isn't throttled. */
export async function resetConfirmSentAt(id: string, value: Date | null): Promise<void> {
  await getDb()
    .update(waitlistSignups)
    .set({ confirmSentAt: value })
    .where(eq(waitlistSignups.id, id));
}

/**
 * Confirms the pending signup holding this token hash, if its email went out after
 * `sentAfter` (the expiry cutoff). Returns true if a row was confirmed. The hash is
 * kept, so a second click on the same link can still be recognized.
 */
export async function confirmPending(args: {
  confirmTokenHash: string;
  sentAfter: Date;
  now: Date;
}): Promise<boolean> {
  const t = waitlistSignups;
  const rows = await getDb()
    .update(t)
    .set({ status: "confirmed", confirmedAt: args.now, updatedAt: args.now })
    .where(
      and(
        eq(t.confirmTokenHash, args.confirmTokenHash),
        eq(t.status, "pending"),
        gt(t.confirmSentAt, args.sentAfter),
      ),
    )
    .returning({ id: t.id });
  return rows.length > 0;
}

export async function findByConfirmHash(
  confirmTokenHash: string,
): Promise<Pick<WaitlistSignup, "status" | "confirmSentAt"> | undefined> {
  const [row] = await getDb()
    .select({ status: waitlistSignups.status, confirmSentAt: waitlistSignups.confirmSentAt })
    .from(waitlistSignups)
    .where(eq(waitlistSignups.confirmTokenHash, confirmTokenHash))
    .limit(1);
  return row;
}

export async function findStatusByUnsubscribeToken(
  unsubscribeToken: string,
): Promise<WaitlistSignup["status"] | undefined> {
  const [row] = await getDb()
    .select({ status: waitlistSignups.status })
    .from(waitlistSignups)
    .where(eq(waitlistSignups.unsubscribeToken, unsubscribeToken))
    .limit(1);
  return row?.status;
}

/**
 * Marks the signup unsubscribed and drops its confirm token, so an old confirm link
 * can't re-subscribe it. Idempotent. Returns false if no signup has this token.
 */
export async function unsubscribeByToken(unsubscribeToken: string, now: Date): Promise<boolean> {
  const rows = await getDb()
    .update(waitlistSignups)
    .set({ status: "unsubscribed", confirmTokenHash: null, updatedAt: now })
    .where(eq(waitlistSignups.unsubscribeToken, unsubscribeToken))
    .returning({ id: waitlistSignups.id });
  return rows.length > 0;
}
