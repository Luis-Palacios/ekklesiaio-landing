import { getTranslations } from "next-intl/server";
import { cacheLife } from "next/cache";
import type { ComponentType, SVGProps } from "react";
import { Link } from "@/i18n/navigation";
import { socialProfiles, type SocialNetwork } from "@/lib/social";
import { FacebookIcon, LinkedInIcon, XIcon } from "../icons";
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

const socialLink =
  "inline-flex size-11 items-center justify-center rounded-full text-on-dark outline-none hover:text-white focus-visible:shadow-focus";

const socialIcons: Record<SocialNetwork, ComponentType<SVGProps<SVGSVGElement>>> = {
  facebook: FacebookIcon,
  x: XIcon,
  linkedin: LinkedInIcon,
};

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
        <nav
          aria-label={t("navLabel")}
          className="flex flex-wrap items-center justify-end gap-x-5 gap-y-3"
        >
          <Link href="/privacy" className={footerLink}>
            {t("privacy")}
          </Link>
          {contactEmail ? (
            <a href={`mailto:${contactEmail}`} className={footerLink}>
              {t("contact")}
            </a>
          ) : null}
          {/* 44px hit areas around 20px glyphs; negative margins keep the
              footer's height and line the last glyph up with the edge. The
              nav's gap-y-3 matches -my-3, so a wrapped row can't overlap. */}
          <span className="-my-3 -mr-3 flex">
            {(Object.keys(socialProfiles) as SocialNetwork[]).map((network) => {
              const Glyph = socialIcons[network];
              return (
                <a
                  key={network}
                  href={socialProfiles[network]}
                  target="_blank"
                  rel="me noopener noreferrer"
                  aria-label={t(`social.${network}`)}
                  className={socialLink}
                >
                  <Glyph className="size-5" />
                </a>
              );
            })}
          </span>
        </nav>
      </div>
    </footer>
  );
}
