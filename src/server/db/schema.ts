import { pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

// docs/DESIGN.md §5.3. `email` is stored lowercase; only the confirm token's
// SHA-256 hash is stored, never the token itself.
export const waitlistSignups = pgTable(
  "waitlist_signups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    locale: text("locale", { enum: ["en", "es"] }).notNull(),
    source: text("source", { enum: ["hero", "cta"] }).notNull(),
    status: text("status", { enum: ["pending", "confirmed", "unsubscribed"] })
      .notNull()
      .default("pending"),
    confirmTokenHash: text("confirm_token_hash"),
    confirmSentAt: timestamp("confirm_sent_at", { withTimezone: true }),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    unsubscribeToken: text("unsubscribe_token").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  // The confirm and unsubscribe pages look signups up by token.
  (t) => [
    uniqueIndex("waitlist_signups_confirm_token_hash_idx").on(t.confirmTokenHash),
    uniqueIndex("waitlist_signups_unsubscribe_token_idx").on(t.unsubscribeToken),
  ],
);

export type WaitlistSignup = typeof waitlistSignups.$inferSelect;
