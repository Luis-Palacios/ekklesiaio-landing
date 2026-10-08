import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

// Static decorative mockup of the weekly AI insights (DESIGN.md §4). role="img"
// makes the contents presentational; the aria-label describes it.

const cardLabel = "text-xs font-bold tracking-[0.06em] uppercase";

function Block({ gap, children }: { gap: string; children: ReactNode }) {
  return (
    <div className={`flex flex-col border-b border-line-subtle px-[22px] py-[18px] ${gap}`}>
      {children}
    </div>
  );
}

const tones = {
  good: { text: "text-navy-900", dot: "bg-navy-900" },
  steady: { text: "text-muted", dot: "border-2 border-subtle" },
  care: { text: "text-gold-900", dot: "bg-gold-500" },
} as const;

function ToneRow({
  group,
  tone,
  label,
}: {
  group: string;
  tone: keyof typeof tones;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="font-semibold text-navy-900">{group}</span>
      <span
        className={`inline-flex items-center gap-1.5 font-semibold whitespace-nowrap ${tones[tone].text}`}
      >
        <span className={`size-2.5 rounded-full ${tones[tone].dot}`} />
        {label}
      </span>
    </div>
  );
}

export function InsightsCard() {
  const t = useTranslations();

  return (
    <div
      role="img"
      aria-label={t("card.aria")}
      className="w-full max-w-[500px] overflow-hidden rounded-panel border border-line bg-surface shadow-float"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line-subtle px-[22px] py-[18px]">
        <strong className="text-base text-navy-900">{t("card.title")}</strong>
        <span className="text-[13px] text-muted">{t("card.from")}</span>
      </div>

      <Block gap="gap-2">
        <span className={`${cardLabel} text-muted`}>{t("card.summaryLabel")}</span>
        <p className="m-0 text-[15px] leading-[1.55] text-ink">{t("card.summary")}</p>
      </Block>

      <Block gap="gap-2.5">
        <span className={`${cardLabel} text-muted`}>{t("card.toneLabel")}</span>
        <div className="flex flex-col gap-2">
          <ToneRow group={t("groups.g1")} tone="good" label={t("card.toneGood")} />
          <ToneRow group={t("groups.g3")} tone="steady" label={t("card.toneSteady")} />
          <ToneRow group={t("groups.g2")} tone="care" label={t("card.toneCare")} />
        </div>
      </Block>

      <Block gap="gap-1.5">
        <span className={`${cardLabel} text-gold-900`}>{t("card.attentionLabel")}</span>
        <span className="text-[15px] font-semibold text-navy-900">{t("card.attention")}</span>
      </Block>

      <div className="m-4 flex flex-col gap-3 rounded-tile border border-gold-200 bg-gold-50 p-4">
        <span className={`${cardLabel} text-gold-900`}>{t("card.prayerLabel")}</span>
        <p className="m-0 font-display text-[19px] leading-[1.4] text-navy-900">
          {t("card.prayer")}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <span className="text-[13px] text-muted">{t("card.caption")}</span>
          <span className="flex gap-2">
            <span className="inline-flex items-center rounded-lg border-[1.5px] border-navy-900 px-3 py-[7px] text-[13px] font-semibold text-navy-900">
              {t("card.edit")}
            </span>
            <span className="inline-flex items-center rounded-lg bg-navy-900 px-3 py-[7px] text-[13px] font-semibold text-white">
              {t("card.approve")}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
