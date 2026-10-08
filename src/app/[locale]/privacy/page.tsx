import type { Metadata } from "next";
import { hasLocale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/site-header";
import { routing } from "@/i18n/routing";

// DRAFT (docs/DESIGN.md §9): Luis writes and approves the final policy text. Only the
// Turnstile disclosure is in so far; Cloudflare requires it for Invisible mode.

const TURNSTILE_ADDENDUM_URL = "https://www.cloudflare.com/turnstile-privacy-policy/";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "privacy" });

  return {
    title: t("title"),
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: { en: "/en/privacy", es: "/es/privacy" },
    },
    // Keep the draft out of search results until it's final.
    robots: { index: false },
  };
}

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  return (
    <>
      <SiteHeader />
      <main className="px-6 py-[clamp(48px,7vw,96px)]">
        <article className="mx-auto flex max-w-[720px] flex-col gap-6">
          <p className="m-0 self-start rounded-tile bg-gold-100 px-3 py-1.5 text-sm font-semibold text-gold-900">
            {t("draftNotice")}
          </p>
          <h1 className="m-0 font-display text-display-md font-medium text-balance text-navy-900">
            {t("title")}
          </h1>

          <section aria-labelledby="turnstile" className="flex flex-col gap-3">
            <h2 id="turnstile" className="m-0 font-display text-2xl font-medium text-navy-900">
              {t("turnstileHeading")}
            </h2>
            <p className="m-0 text-[17px] leading-relaxed text-pretty text-ink">
              {t.rich("turnstileBody", {
                link: (chunks) => (
                  <a
                    href={TURNSTILE_ADDENDUM_URL}
                    hrefLang="en"
                    className="rounded-sm text-navy-900 underline underline-offset-[3px] outline-none focus-visible:shadow-focus"
                  >
                    {chunks}
                  </a>
                ),
              })}{" "}
              <mark className="rounded-sm bg-gold-100 px-1 text-sm font-semibold text-gold-900">
                {t("reviewMarker")}
              </mark>
            </p>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
