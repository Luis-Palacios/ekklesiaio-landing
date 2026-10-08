import { useTranslations } from "next-intl";
import {
  FlagIcon,
  LinesIcon,
  PrayerMessageIcon,
  PulseIcon,
  ShieldIcon,
  ToggleIcon,
  UserCheckIcon,
} from "../icons";
import { InsightsCard } from "../illustrations/insights-card";
import { container, Eyebrow, sectionPadding, sectionTitle } from "../typography";

const items = [
  { Icon: LinesIcon, title: "i1t", body: "i1b" },
  { Icon: PulseIcon, title: "i2t", body: "i2b" },
  { Icon: FlagIcon, title: "i3t", body: "i3b" },
  { Icon: PrayerMessageIcon, title: "i4t", body: "i4b" },
] as const;

const trust = [
  { Icon: ToggleIcon, strong: "t1s", body: "t1b" },
  { Icon: UserCheckIcon, strong: "t2s", body: "t2b" },
  { Icon: ShieldIcon, strong: "t3s", body: "t3b" },
] as const;

export function AiInsights() {
  const t = useTranslations("ai");

  return (
    <section
      id="ai-insights"
      aria-labelledby="ai-title"
      className={`${sectionPadding} border-t border-line bg-navy-50`}
    >
      <div className={`${container} flex flex-wrap items-center gap-[clamp(40px,6vw,72px)]`}>
        <div className="flex min-w-0 flex-[1_1_500px] flex-col gap-7">
          <div className="flex flex-col gap-4">
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h2 id="ai-title" className={`${sectionTitle} text-navy-900`}>
              {t("titleA")}
              <em className="font-normal italic">{t("titleEm")}</em>
            </h2>
            <p className="m-0 text-[19px] text-pretty text-ink">{t("intro")}</p>
          </div>

          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(230px,100%),1fr))] gap-6 p-0">
            {items.map(({ Icon, title, body }) => (
              <li key={title} className="flex flex-col gap-2">
                <span className="flex size-10 items-center justify-center rounded-control border border-line bg-surface">
                  <Icon className="size-5 text-navy-900" />
                </span>
                <h3 className="m-0 text-[17px] font-bold text-navy-900">{t(title)}</h3>
                <p className="m-0 text-[15px] text-ink">{t(body)}</p>
              </li>
            ))}
          </ul>

          <ul
            aria-label={t("trustAria")}
            className="m-0 flex list-none flex-col gap-3.5 border-t border-line-strong px-0 pt-5 pb-0"
          >
            {trust.map(({ Icon, strong, body }) => (
              <li key={strong} className="flex items-start gap-3 text-base text-ink">
                <Icon className="mt-0.5 size-5 flex-none text-gold-800" />
                <span>
                  <strong className="text-navy-900">{t(strong)}</strong> {t(body)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-w-0 flex-[1_1_420px] justify-center">
          <InsightsCard />
        </div>
      </div>
    </section>
  );
}
