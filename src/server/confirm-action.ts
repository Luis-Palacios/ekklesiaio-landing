"use server";

import { hasLocale } from "next-intl";
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";
import { confirmSubscription } from "./subscription";
import { isToken } from "./tokens";

// The confirm page's button. Confirming takes this POST, not a page load, so mail
// scanners that open links can't confirm on someone's behalf.
export async function confirmAction(formData: FormData) {
  const param = formData.get("locale");
  const locale = hasLocale(routing.locales, param) ? param : routing.defaultLocale;
  const token = formData.get("token");

  let confirmed = false;
  try {
    confirmed = await confirmSubscription(token);
  } catch (error) {
    console.error("[confirm] failed:", error);
    const retry = new URLSearchParams({ ...(isToken(token) && { token }), error: "1" });
    redirect(`/${locale}/confirm?${retry}`);
  }

  // Static result pages, so the token leaves the address bar and the language
  // switcher (which drops the query string) keeps showing the same result.
  redirect(`/${locale}/confirm/${confirmed ? "success" : "invalid"}`);
}
