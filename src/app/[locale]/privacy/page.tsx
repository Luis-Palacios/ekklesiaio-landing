import type { Metadata } from "next";
import { hasLocale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/site-header";
import { routing } from "@/i18n/routing";

// The approved policy (docs/privacy-policy.md). Its text lives in messages/*.json under
// privacy.*; edit it there, and keep it word-for-word with the approved source.

const PROVIDER_LINKS = {
  vercel: "https://vercel.com/legal/privacy-notice",
  databricks: "https://www.databricks.com/legal/privacynotice",
  upstash: "https://upstash.com/trust/privacy.pdf",
  resend: "https://resend.com/legal/privacy-policy",
  turnstile: "https://www.cloudflare.com/turnstile-privacy-policy/",
} as const;

const linkClass =
  "rounded-sm text-navy-900 underline underline-offset-[3px] outline-none focus-visible:shadow-focus";

const textOf = (chunks: ReactNode) => (Array.isArray(chunks) ? chunks.join("") : String(chunks));

// Rich-text tags used in privacy.* messages.
const tags = {
  b: (chunks: ReactNode) => <strong className="font-semibold text-navy-900">{chunks}</strong>,
  code: (chunks: ReactNode) => (
    <code className="rounded-sm bg-navy-50 px-1 py-0.5 text-[0.9em] break-all text-navy-900">
      {chunks}
    </code>
  ),
  email: (chunks: ReactNode) => (
    <a href={`mailto:${textOf(chunks)}`} className={linkClass}>
      {chunks}
    </a>
  ),
  ...Object.fromEntries(
    Object.entries(PROVIDER_LINKS).map(([tag, href]) => [
      tag,
      (chunks: ReactNode) => (
        // The providers' policies are in English only.
        <a href={href} hrefLang="en" className={linkClass}>
          {chunks}
        </a>
      ),
    ]),
  ),
};

type Translator = ReturnType<typeof useTranslations<"privacy">>;
// privacy.* keys under arrays (list items, table cells), which the typed keys don't cover.
type IndexedKey = Parameters<Translator["rich"]>[0];

function rich(t: Translator, key: string) {
  return t.rich(key as IndexedKey, tags);
}

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
  };
}

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  const paragraph = (key: string) => (
    <p className="m-0 text-[17px] leading-relaxed text-pretty text-ink">{rich(t, key)}</p>
  );

  const list = (key: "use.items" | "rights.items") => (
    <ul className="m-0 flex list-disc flex-col gap-2 pl-6 text-[17px] leading-relaxed text-ink marker:text-navy-900">
      {(t.raw(key) as string[]).map((_, i) => (
        <li key={i} className="pl-1 text-pretty">
          {rich(t, `${key}.${i}`)}
        </li>
      ))}
    </ul>
  );

  const table = (key: "collect" | "providers" | "retention" | "cookies") => (
    <div className="overflow-x-auto rounded-tile border border-line bg-surface">
      <table
        aria-labelledby={`privacy-${key}`}
        className="w-full border-collapse text-left text-[15px] leading-normal"
      >
        <thead className="bg-navy-50 text-navy-900">
          <tr>
            {(t.raw(`${key}.columns`) as string[]).map((_, i) => (
              <th key={i} scope="col" className="px-3 py-2.5 align-bottom font-semibold sm:px-4">
                {t(`${key}.columns.${i}` as IndexedKey)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(t.raw(`${key}.rows`) as string[][]).map((row, r) => (
            <tr key={r} className="border-t border-line">
              {row.map((_, c) => {
                const cell = rich(t, `${key}.rows.${r}.${c}`);
                const cellClass = "px-3 py-3 align-top text-pretty sm:px-4";
                return c === 0 ? (
                  <th key={c} scope="row" className={`${cellClass} font-semibold text-navy-900`}>
                    {cell}
                  </th>
                ) : (
                  <td key={c} className={`${cellClass} text-ink`}>
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const section = (key: string, children: ReactNode) => (
    <section aria-labelledby={`privacy-${key}`} className="flex flex-col gap-4">
      <h2
        id={`privacy-${key}`}
        className="m-0 font-display text-[28px] leading-tight font-medium text-balance text-navy-900"
      >
        {t(`${key}.heading` as IndexedKey)}
      </h2>
      {children}
    </section>
  );

  return (
    <>
      <SiteHeader />
      <main className="px-6 py-[clamp(48px,7vw,96px)]">
        <article className="mx-auto flex max-w-[760px] flex-col gap-12">
          <header className="flex flex-col gap-4">
            <h1 className="m-0 font-display text-display-md font-medium text-balance text-navy-900">
              {t("title")}
            </h1>
            <p className="m-0 text-[17px] text-muted">{t.rich("effectiveDate", tags)}</p>
          </header>

          {section(
            "who",
            <>
              {paragraph("who.body.0")}
              {paragraph("who.body.1")}
            </>,
          )}
          {section(
            "collect",
            <>
              {paragraph("collect.intro")}
              {table("collect")}
            </>,
          )}
          {section(
            "use",
            <>
              {paragraph("use.intro")}
              {list("use.items")}
            </>,
          )}
          {section(
            "providers",
            <>
              {paragraph("providers.intro")}
              {table("providers")}
              {paragraph("providers.turnstile")}
            </>,
          )}
          {section("storage", paragraph("storage.body"))}
          {section("retention", table("retention"))}
          {section(
            "rights",
            <>
              {paragraph("rights.intro")}
              {list("rights.items")}
              {paragraph("rights.outro")}
            </>,
          )}
          {section(
            "cookies",
            <>
              {paragraph("cookies.intro")}
              {table("cookies")}
              {paragraph("cookies.outro")}
            </>,
          )}
          {section("children", paragraph("children.body"))}
          {section("changes", paragraph("changes.body"))}
          {section("contact", paragraph("contact.body"))}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
