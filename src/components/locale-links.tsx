"use client";

// Client only for usePathname: the links point at the current page in the other
// locale. They are server-rendered <a> elements, so switching works without JS.

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { localeNames, type routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

export function LocaleLinks({ locales }: { locales: readonly Locale[] }) {
  const current = useLocale();
  const pathname = usePathname();

  return locales.map((locale) => {
    const active = locale === current;
    return (
      <Link
        key={locale}
        href={pathname}
        locale={locale}
        lang={locale}
        hrefLang={locale}
        aria-label={localeNames[locale]}
        aria-current={active ? "true" : undefined}
        className={`inline-flex h-[38px] min-w-11 items-center justify-center rounded-[7px] px-2.5 text-sm font-bold uppercase no-underline outline-none focus-visible:shadow-focus ${
          active ? "bg-navy-900 text-white" : "text-ink hover:bg-navy-50"
        }`}
      >
        {locale}
      </Link>
    );
  });
}
