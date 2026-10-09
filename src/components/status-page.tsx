import type { Metadata } from "next";
import { useLocale } from "next-intl";
import type { ReactNode } from "react";
import { CheckIcon } from "./icons";
import { SiteFooter } from "./sections/site-footer";
import { SiteHeader } from "./site-header";

// Shell for the confirm and unsubscribe pages (docs/DESIGN.md §5.4): the landing
// page's header and footer around a centered card on paper.

/** These pages are reached from email links, so they stay out of search results. */
export function statusPageMetadata(title: string): Metadata {
  return { title, robots: { index: false, follow: false } };
}

export function StatusPage({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-[60vh] items-center justify-center px-6 py-[clamp(48px,7vw,96px)]">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

export function StatusCard({
  success = false,
  title,
  body,
  children,
}: {
  success?: boolean;
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex w-full max-w-[560px] flex-col items-start gap-5 rounded-panel border border-line bg-surface px-[clamp(24px,5vw,40px)] py-[clamp(28px,5vw,44px)] shadow-float">
      {success && (
        <span className="flex size-11 items-center justify-center rounded-full bg-navy-900 text-gold-500">
          <CheckIcon className="size-6" />
        </span>
      )}
      <div className="flex flex-col gap-3">
        <h1 className="m-0 font-display text-[clamp(28px,4vw,36px)] leading-[1.15] font-medium text-balance text-navy-900">
          {title}
        </h1>
        <p className="m-0 text-[17px] leading-relaxed text-pretty text-ink">{body}</p>
      </div>
      {children}
    </div>
  );
}

const buttonClass =
  "inline-flex min-h-11 items-center rounded-control bg-navy-900 px-[18px] text-[15px] font-semibold text-white no-underline outline-none hover:bg-navy-800 focus-visible:shadow-focus";

/** Link back to the landing page, styled like the header CTA. */
export function HomeLink({ hash = "", children }: { hash?: string; children: ReactNode }) {
  return (
    <a href={`/${useLocale()}${hash}`} className={buttonClass}>
      {children}
    </a>
  );
}

export { buttonClass as statusButtonClass };
