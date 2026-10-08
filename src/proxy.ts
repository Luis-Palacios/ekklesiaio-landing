import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next/Vercel internals, paths containing a dot
  // (icon.svg) and the extensionless /apple-icon route.
  matcher: "/((?!api|_next|_vercel|apple-icon|.*\\..*).*)",
};
