import { useTranslations } from "next-intl";
import { LogoMark } from "../logo";
import { WaitlistForm } from "../waitlist-form";

export function ClosingCta() {
  const t = useTranslations("cta");

  return (
    <section
      aria-labelledby="cta-title"
      className="bg-navy-900 px-6 py-[clamp(72px,10vw,128px)] text-white"
    >
      <div className="mx-auto flex max-w-[760px] flex-col items-center gap-5 text-center">
        <LogoMark variant="dark" width={56} height={56} />
        <h2
          id="cta-title"
          className="m-0 font-display text-display-lg font-medium text-balance text-white"
        >
          {t("titleA")}
          <em className="font-normal text-gold-500 italic">{t("titleEm")}</em>
        </h2>
        <p className="m-0 text-[19px] text-pretty text-on-dark">{t("body")}</p>
        <div className="w-full max-w-[560px] pt-3 text-left">
          <WaitlistForm variant="dark" source="cta" />
        </div>
      </div>
    </section>
  );
}
