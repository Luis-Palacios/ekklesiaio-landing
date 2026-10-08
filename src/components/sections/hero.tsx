import { useTranslations } from "next-intl";
import { ArrowRightIcon } from "../icons";
import { ReportsCard } from "../illustrations/reports-card";
import { container } from "../typography";
import { WaitlistForm } from "../waitlist-form";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section
      aria-labelledby="hero-title"
      className="px-6 pt-[clamp(56px,8vw,104px)] pb-[clamp(64px,9vw,120px)]"
    >
      <div className={`${container} flex flex-wrap items-center gap-[clamp(40px,6vw,72px)]`}>
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-100 px-3 py-1.5 text-sm font-semibold text-gold-900">
              <span className="size-2 rounded-full bg-gold-500" aria-hidden="true" />
              <span>{t("badge")}</span>
            </span>
            <span className="text-sm font-medium text-muted">{t("tagline")}</span>
          </div>

          <h1
            id="hero-title"
            className="m-0 font-display text-display-xl font-medium text-balance text-navy-900"
          >
            {t("titleA")}
            <em className="font-normal italic underline decoration-gold-500 decoration-[0.08em] underline-offset-[0.12em]">
              {t("titleEm")}
            </em>
          </h1>
          <p className="m-0 max-w-[560px] text-lead text-pretty text-ink">{t("p1")}</p>
          <p className="m-0 max-w-[560px] text-lead leading-normal font-semibold text-pretty text-navy-900">
            {t("p2")}
          </p>

          <div id="waitlist" className="flex max-w-[560px] flex-col gap-3 pt-2">
            <WaitlistForm variant="light" source="hero" />
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#how-it-works"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-sm text-[15px] font-semibold text-navy-900 no-underline outline-none hover:underline focus-visible:shadow-focus"
              >
                {t("howLink")}
                <ArrowRightIcon className="size-4" />
              </a>
              <span className="text-sm text-muted">{t("noSpam")}</span>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-[1_1_400px] justify-center">
          <ReportsCard />
        </div>
      </div>
    </section>
  );
}
