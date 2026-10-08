import { useTranslations } from "next-intl";
import { container, Eyebrow, sectionPadding, sectionTitle } from "../typography";

type Step = { n: string; title: string; body: string };

export function HowItWorks() {
  const t = useTranslations("how");
  const steps: Step[] = t.raw("steps");

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className={`${sectionPadding} bg-navy-900 text-white`}
    >
      <div className={`${container} flex flex-col gap-14`}>
        <div className="flex max-w-[760px] flex-col gap-4">
          <Eyebrow tone="onDark">{t("eyebrow")}</Eyebrow>
          <h2 id="how-title" className={`${sectionTitle} text-white`}>
            {t("title")}
          </h2>
        </div>
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-8 p-0">
          {steps.map((step) => (
            <li key={step.n} className="flex flex-col gap-3 border-t border-white/18 pt-6">
              <span
                className="font-display text-[44px] leading-none text-gold-500"
                aria-hidden="true"
              >
                {step.n}
              </span>
              <h3 className="m-0 text-xl font-bold text-white">{step.title}</h3>
              <p className="m-0 text-base text-on-dark">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
