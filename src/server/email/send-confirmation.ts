import "server-only";
import type { Locale } from "next-intl";

export type ConfirmationEmail = {
  to: string;
  locale: Locale;
  confirmToken: string;
  unsubscribeToken: string;
};

/**
 * Step 4 stub: step 5 replaces this with the React Email template sent through Resend.
 * Throwing here is treated as a send failure by the waitlist action.
 */
export async function sendConfirmationEmail({ locale, confirmToken }: ConfirmationEmail) {
  if (process.env.NODE_ENV === "production") {
    console.warn("[email] confirmation email not sent: sending arrives in step 5");
    return;
  }
  console.info(`[email] (dev stub) confirm link: /${locale}/confirm?token=${confirmToken}`);
}
