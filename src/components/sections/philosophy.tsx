import { useTranslations } from "next-intl";
import { container, Eyebrow, sectionPadding, sectionTitle } from "../typography";

const panels = [
  { label: "missionLabel", text: "mission" },
  { label: "visionLabel", text: "vision" },
] as const;

export function Philosophy() {
  const t = useTranslations("philosophy");

  return (
    <section
      aria-labelledby="philosophy-title"
      className={`${sectionPadding} border-t border-line bg-surface`}
    >
      <div className={`${container} flex flex-col gap-[clamp(48px,6vw,80px)]`}>
        <div className="flex flex-wrap items-start gap-[clamp(24px,5vw,72px)]">
          <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-4">
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h2 id="philosophy-title" className={`${sectionTitle} text-navy-900`}>
              {t("titleA")}
              <em className="font-normal italic">{t("titleEm")}</em>
            </h2>
          </div>
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4 pt-2">
            <p className="m-0 text-[19px] text-pretty text-ink">{t("p1")}</p>
            <p className="m-0 text-[19px] text-pretty text-ink">{t("p2")}</p>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))] gap-6">
          {panels.map(({ label, text }) => (
            <div
              key={label}
              className="flex flex-col gap-3.5 rounded-panel border border-line bg-paper p-[clamp(28px,3.5vw,40px)]"
            >
              <Eyebrow>{t(label)}</Eyebrow>
              <p className="m-0 font-display text-display-sm text-pretty text-navy-900">
                {t(text)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
