import { useTranslations } from "next-intl";
import { CrossIcon } from "../icons";
import { container, Eyebrow, sectionPadding, sectionTitle } from "../typography";

const panel = "flex flex-col gap-5 rounded-panel border border-line p-[clamp(28px,3.5vw,40px)]";

export function Problem() {
  const t = useTranslations("problem");
  const aItems: string[] = t.raw("aItems");
  const bItems: string[] = t.raw("bItems");

  return (
    <section
      aria-labelledby="problem-title"
      className={`${sectionPadding} border-y border-line bg-surface`}
    >
      <div className={`${container} flex flex-col gap-12`}>
        <div className="flex max-w-[760px] flex-col gap-4">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 id="problem-title" className={`${sectionTitle} text-navy-900`}>
            {t("title")}
          </h2>
          <p className="m-0 text-[19px] text-ink">{t("intro")}</p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))] gap-6">
          <div className={`${panel} bg-paper`}>
            <Eyebrow tone="muted">{t("aLabel")}</Eyebrow>
            <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
              {aItems.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3.5 font-display text-2xl leading-[1.3] text-navy-900"
                >
                  <span
                    className="size-2.5 flex-none rounded-full bg-gold-500"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className={`${panel} bg-navy-50`}>
            <Eyebrow tone="muted">{t("bLabel")}</Eyebrow>
            <p className="m-0 text-lg font-semibold text-navy-900">{t("bLead")}</p>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {bItems.map((item) => (
                <li key={item} className="flex items-baseline gap-3 text-[17px] text-ink">
                  <span
                    className="h-0.5 w-3.5 flex-none -translate-y-[5px] bg-subtle"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="m-0 flex items-center gap-3.5 font-display text-[clamp(26px,2.8vw,34px)] font-medium text-navy-900">
          <CrossIcon className="size-7 flex-none text-gold-500" />
          <span>{t("closing")}</span>
        </p>
      </div>
    </section>
  );
}
