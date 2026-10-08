import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";

const navLinks = [
  { href: "#how-it-works", key: "how" },
  { href: "#features", key: "features" },
  { href: "#ai-insights", key: "ai" },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/92 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-6 py-3">
        <a
          href="#top"
          aria-label="ekklesiaio"
          className="flex items-center rounded-control outline-none focus-visible:shadow-focus"
        >
          <Logo />
        </a>
        <nav aria-label={t("primaryLabel")} className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {navLinks.map(({ href, key }) => (
            <a
              key={key}
              href={href}
              className="rounded-sm text-[15px] font-medium text-ink no-underline outline-none hover:text-navy-900 focus-visible:shadow-focus"
            >
              {t(key)}
            </a>
          ))}
          <LanguageSwitcher />
          <a
            href="#waitlist"
            className="inline-flex min-h-11 items-center rounded-control bg-navy-900 px-[18px] text-[15px] font-semibold text-white no-underline outline-none hover:bg-navy-800 focus-visible:shadow-focus"
          >
            {t("cta")}
          </a>
        </nav>
      </div>
    </header>
  );
}
