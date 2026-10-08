import { getTranslations } from "next-intl/server";
import { cacheLife } from "next/cache";
import { Link } from "@/i18n/navigation";
import { container } from "../typography";

// `new Date()` would break prerendering under cacheComponents, so the year is
// computed in a cached scope and refreshed daily.
async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

const footerLink =
  "rounded-sm text-on-dark underline underline-offset-[3px] outline-none hover:text-white focus-visible:shadow-focus";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const year = await currentYear();
  const contactEmail = process.env.CONTACT_EMAIL;

  return (
    <footer className="bg-navy-950 px-6 py-7 text-on-dark">
      <div className={`${container} flex flex-wrap items-center justify-between gap-4 text-sm`}>
        <span className="flex items-center gap-2.5">
          <span className="font-logo text-lg font-[650] tracking-[-0.03em]">
            <span className="text-white">ekklesia</span>
            <span className="text-gold-500">io</span>
          </span>
          <span>© {year} ekklesiaio</span>
        </span>
        <nav aria-label={t("navLabel")} className="flex flex-wrap gap-5">
          <Link href="/privacy" className={footerLink}>
            {t("privacy")}
          </Link>
          {contactEmail ? (
            <a href={`mailto:${contactEmail}`} className={footerLink}>
              {t("contact")}
            </a>
          ) : null}
        </nav>
      </div>
    </footer>
  );
}
