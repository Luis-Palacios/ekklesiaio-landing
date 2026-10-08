/**
 * The site's absolute origin, for metadataBase, sitemap, robots and OG URLs.
 *
 * Order: NEXT_PUBLIC_SITE_URL → Vercel production domain → Vercel deployment
 * URL → http://localhost:3000 (dev only). Bare hostnames (as Vercel's vars
 * are, and as NEXT_PUBLIC_SITE_URL may be) get https://.
 */
export function getSiteUrl(): URL {
  const value =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;
  if (value) return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);

  if (process.env.NODE_ENV !== "production") return new URL("http://localhost:3000");

  throw new Error(
    "Site URL is not set. Set NEXT_PUBLIC_SITE_URL (e.g. in .env.local) for production builds outside Vercel.",
  );
}
