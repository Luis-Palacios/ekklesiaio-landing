import "server-only";
import { CONFIRM_TTL_MS } from "./subscription";
import { deleteStalePending } from "./waitlist-repo";

/** Sign-ups never confirmed are deleted after 30 days (privacy policy; docs/DESIGN.md §5.6). */
export const PENDING_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Deletes pending signups older than 30 days. A re-signup keeps its original
 * created_at but gets a fresh confirm link, so rows whose link is still valid
 * (sent within CONFIRM_TTL_MS) are kept until it expires. Returns the count.
 */
export async function purgeUnconfirmed(now = new Date()): Promise<number> {
  return deleteStalePending({
    createdBefore: new Date(now.getTime() - PENDING_RETENTION_MS),
    sentBefore: new Date(now.getTime() - CONFIRM_TTL_MS),
  });
}
