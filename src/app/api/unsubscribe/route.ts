import { hasLocale } from "next-intl";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { unsubscribe } from "@/server/subscription";

// The List-Unsubscribe target in the email headers.
//   POST: RFC 8058 one-click unsubscribe, sent by the mail client (Gmail, Apple Mail…).
//   GET:  clients without one-click support open the URL; send them to the page,
//         which asks before unsubscribing.

export async function POST(request: NextRequest) {
  try {
    const found = await unsubscribe(request.nextUrl.searchParams.get("token"));
    return new NextResponse(null, { status: found ? 200 : 404 });
  } catch (error) {
    console.error("[unsubscribe] one-click failed:", error);
    return new NextResponse(null, { status: 500 });
  }
}

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lang = params.get("locale");
  const locale = hasLocale(routing.locales, lang) ? lang : routing.defaultLocale;
  const target = new URL(`/${locale}/unsubscribe`, request.url);
  const token = params.get("token");
  if (token) target.searchParams.set("token", token);
  return NextResponse.redirect(target, 303);
}
