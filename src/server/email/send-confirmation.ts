import "server-only";
import { createTranslator, type Locale } from "next-intl";
import { createElement } from "react";
import { render } from "react-email";
import { Resend } from "resend";
import { getSiteUrl } from "@/lib/site-url";
import en from "../../../messages/en.json";
import es from "../../../messages/es.json";
import { hashToken } from "../tokens";
import { ConfirmEmail } from "./confirm-email";

export type ConfirmationEmail = {
  to: string;
  locale: Locale;
  confirmToken: string;
  unsubscribeToken: string;
};

const messages = { en, es } satisfies Record<Locale, unknown>;

/** Absolute links for the email, built on the site URL. */
export function emailLinks(locale: Locale, confirmToken: string, unsubscribeToken: string) {
  const site = getSiteUrl();
  const link = (path: string, params: Record<string, string>) =>
    `${new URL(path, site).href}?${new URLSearchParams(params)}`;

  return {
    confirm: link(`/${locale}/confirm`, { token: confirmToken }),
    unsubscribe: link(`/${locale}/unsubscribe`, { token: unsubscribeToken }),
    // RFC 8058 one-click target for the List-Unsubscribe header.
    oneClick: link("/api/unsubscribe", { locale, token: unsubscribeToken }),
  };
}

/**
 * The From header: `Name <address>` from EMAIL_FROM_NAME and EMAIL_FROM, or just the
 * address without a name. Whitespace in the name (including pasted non-breaking
 * spaces, which Resend rejects) collapses to plain spaces.
 */
export function formatFrom(address: string | undefined, name: string | undefined) {
  const email = address?.trim();
  if (!email) return undefined;
  const display = name?.replace(/\s+/gu, " ").trim();
  return display ? `${display} <${email}>` : email;
}

/**
 * Sends the double opt-in email through Resend, in the signup's locale. Throws on
 * failure; the waitlist action turns that into the form's error state.
 * Without RESEND_API_KEY / EMAIL_FROM: dev logs the confirm link, production throws.
 */
export async function sendConfirmationEmail({
  to,
  locale,
  confirmToken,
  unsubscribeToken,
}: ConfirmationEmail) {
  const links = emailLinks(locale, confirmToken, unsubscribeToken);
  const apiKey = process.env.RESEND_API_KEY;
  const from = formatFrom(process.env.EMAIL_FROM, process.env.EMAIL_FROM_NAME);

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY or EMAIL_FROM is not set");
    }
    console.info(`[email] (dev, not sent) confirm link: ${links.confirm}`);
    return;
  }

  const t = createTranslator({ locale, messages: messages[locale], namespace: "email" });
  const email = createElement(ConfirmEmail, {
    locale,
    confirmUrl: links.confirm,
    unsubscribeUrl: links.unsubscribe,
    copy: {
      preview: t("preview"),
      heading: t("heading"),
      body: t("body"),
      button: t("button"),
      ignore: t("ignore"),
      unsubscribe: t("unsubscribe"),
    },
  });
  const [html, text] = await Promise.all([render(email), render(email, { plainText: true })]);

  const { error } = await new Resend(apiKey).emails.send(
    {
      from,
      to,
      subject: t("subject"),
      html,
      text,
      headers: {
        "List-Unsubscribe": `<${links.oneClick}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    },
    // One email per token, even if a request is retried. Hashed: keys may be logged.
    { idempotencyKey: `confirm-email/${hashToken(confirmToken)}` },
  );
  if (error) throw new Error(`Resend send failed: ${error.name}: ${error.message}`);
}
