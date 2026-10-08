CREATE TABLE "waitlist_signups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"locale" text NOT NULL,
	"source" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"confirm_token_hash" text,
	"confirm_sent_at" timestamp with time zone,
	"confirmed_at" timestamp with time zone,
	"unsubscribe_token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_signups_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_signups_confirm_token_hash_idx" ON "waitlist_signups" USING btree ("confirm_token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_signups_unsubscribe_token_idx" ON "waitlist_signups" USING btree ("unsubscribe_token");