import { hasLocale } from "next-intl";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { confirmSubscription } from "@/server/subscription";

// The confirm link in the email (docs/DESIGN.md §5.4). Confirms, then redirects to a
// static result page, so the token leaves the address bar and the language switcher
// (which drops the query string) keeps showing the same result.
export async function GET(request: NextRequest, ctx: RouteContext<"/[locale]/confirm">) {
  const { locale: param } = await ctx.params;
  const locale = hasLocale(routing.locales, param) ? param : routing.defaultLocale;

  let confirmed = false;
  try {
    confirmed = await confirmSubscription(request.nextUrl.searchParams.get("token"));
  } catch (error) {
    // Same page as a bad link: joining again sends a fresh, working one.
    console.error("[confirm] failed:", error);
  }

  const result = confirmed ? "success" : "invalid";
  const response = NextResponse.redirect(new URL(`/${locale}/confirm/${result}`, request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex");
  return response;
}
