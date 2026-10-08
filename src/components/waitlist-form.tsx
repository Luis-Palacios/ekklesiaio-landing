import { useTranslations } from "next-intl";

// Step 3: idle visual shell only. Step 4 makes this a client component with the
// server action and the states in docs/design/waitlist-states.dc.html. Until then
// the input has no `name`, so an early submit can't put an email in the URL.

type Props = {
  variant: "light" | "dark";
  source: "hero" | "cta";
};

const styles = {
  light: {
    label: "text-navy-900",
    input: "border-field focus:border-navy-900",
    button: "px-[22px]",
    message: "text-muted",
  },
  dark: {
    label: "text-white",
    input: "border-white",
    button: "px-6",
    message: "text-on-dark",
  },
} as const;

export function WaitlistForm({ variant, source }: Props) {
  const t = useTranslations("form");
  const s = styles[variant];
  const inputId = `${source}-email`;
  const messageId = `${source}-msg`;

  return (
    <form className="flex flex-col gap-2">
      <label htmlFor={inputId} className={`text-sm font-semibold ${s.label}`}>
        {t(source === "hero" ? "heroLabel" : "ctaLabel")}
      </label>
      <div className="flex flex-wrap gap-2.5">
        <input
          id={inputId}
          type="email"
          autoComplete="email"
          placeholder={t("placeholder")}
          aria-describedby={messageId}
          className={`h-[52px] min-w-0 flex-[1_1_240px] rounded-control border-[1.5px] bg-surface px-4 text-base text-navy-900 outline-none focus:shadow-focus ${s.input}`}
        />
        <button
          type="submit"
          className={`h-[52px] flex-none cursor-pointer rounded-control bg-gold-500 text-base font-bold text-navy-900 outline-none focus-visible:shadow-focus ${s.button}`}
        >
          {t(source === "hero" ? "heroButton" : "ctaButton")}
        </button>
      </div>
      <div id={messageId} role="status" className={`min-h-[22px] text-sm ${s.message}`} />
    </form>
  );
}
