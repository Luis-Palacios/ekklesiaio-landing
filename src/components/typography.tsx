import type { ReactNode } from "react";

// Shared text styles from docs/design/landing-page.dc.html.

const eyebrowTone = {
  gold: "text-gold-800",
  muted: "text-muted",
  onDark: "text-gold-500",
} as const;

export function Eyebrow({
  tone = "gold",
  children,
}: {
  tone?: keyof typeof eyebrowTone;
  children: ReactNode;
}) {
  return (
    <span className={`text-[13px] font-bold tracking-[0.08em] uppercase ${eyebrowTone[tone]}`}>
      {children}
    </span>
  );
}

/** Section h2: Newsreader 34 → 54px. */
export const sectionTitle = "m-0 font-display text-display-md font-medium text-balance";

/** Container shared by every section. */
export const container = "mx-auto max-w-[1200px]";

/** Standard section padding (DESIGN.md §3.3). */
export const sectionPadding = "px-6 py-[clamp(64px,9vw,120px)]";
