import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";

// Every indexable page, once per locale, with the same hreflang alternates as its
// generateMetadata. No lastModified: there's no meaningful date to give.
const pages = [
  { path: "", xDefault: true },
  { path: "/privacy", xDefault: false },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, getSiteUrl()).toString();

  return pages.flatMap(({ path, xDefault }) => {
    const languages: Record<string, string> = Object.fromEntries(
      routing.locales.map((locale) => [locale, url(`/${locale}${path}`)]),
    );
    if (xDefault) languages["x-default"] = url("/");

    return routing.locales.map((locale) => ({
      url: url(`/${locale}${path}`),
      alternates: { languages },
    }));
  });
}
