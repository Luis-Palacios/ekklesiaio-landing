import * as z from "zod/mini";
import { routing } from "@/i18n/routing";

// Shared by the client form (instant feedback) and the server action (authoritative).
// zod/mini keeps the client bundle small.

export const waitlistSources = ["hero", "cta"] as const;
export type WaitlistSource = (typeof waitlistSources)[number];

export const emailSchema = z.pipe(
  z.string().check(z.trim(), z.toLowerCase(), z.maxLength(254)),
  z.email(),
);

export const waitlistSchema = z.object({
  email: emailSchema,
  locale: z.enum(routing.locales),
  source: z.enum(waitlistSources),
  // Honeypot: real people never see or fill it.
  company: z.optional(z.string()),
  "cf-turnstile-response": z.optional(z.string()),
});

export type WaitlistState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "invalid"; email: string }
  | { status: "error"; email: string };
