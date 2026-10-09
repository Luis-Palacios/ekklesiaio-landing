import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";
import { socialProfiles } from "@/lib/social";
import { fontVariables } from "../fonts";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: getSiteUrl(),
    title: t("title"),
    description: t("description"),
    // Images come from opengraph-image.tsx (Next also emits them as twitter:image).
    openGraph: {
      type: "website",
      siteName: "ekklesiaio",
      title: t("title"),
      description: t("description"),
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const siteUrl = getSiteUrl();
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ekklesiaio",
    url: siteUrl.href,
    logo: new URL("/brand/icon.svg", siteUrl).href,
    sameAs: Object.values(socialProfiles),
  };

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <script
          type="application/ld+json"
          // Escape "<" so the JSON can't close the script tag.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organization).replace(/</g, "\\u003c"),
          }}
        />
        {/* Client components get only the messages they need, passed per subtree. */}
        <NextIntlClientProvider messages={null}>{children}</NextIntlClientProvider>
        {/* Cookieless page views; off in development. */}
        <Analytics />
      </body>
    </html>
  );
}
