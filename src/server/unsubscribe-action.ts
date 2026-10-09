"use server";

import { hasLocale } from "next-intl";
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";
import { unsubscribe } from "./subscription";
import { isToken } from "./tokens";

// The unsubscribe page's button. Unsubscribing takes this POST, not a page load, so
// mail scanners that open links can't remove anyone.
export async function unsubscribeAction(formData: FormData) {
  const param = formData.get("locale");
  const locale = hasLocale(routing.locales, param) ? param : routing.defaultLocale;
  const token = formData.get("token");

  let done = false;
  try {
    done = await unsubscribe(token);
  } catch (error) {
    console.error("[unsubscribe] failed:", error);
    const retry = new URLSearchParams({ ...(isToken(token) && { token }), error: "1" });
    redirect(`/${locale}/unsubscribe?${retry}`);
  }

  redirect(done ? `/${locale}/unsubscribe/done` : `/${locale}/unsubscribe`);
}
