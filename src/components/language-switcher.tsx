import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { GlobeIcon } from "./icons";
import { LocaleLinks } from "./locale-links";

export function LanguageSwitcher() {
  const t = useTranslations("nav");

  return (
    <div
      role="group"
      aria-label={t("langLabel")}
      className="inline-flex items-center gap-0.5 rounded-control border border-line-strong bg-surface py-[3px] pr-[3px] pl-2.5"
    >
      <GlobeIcon className="mr-1 size-4 text-muted" />
      <LocaleLinks locales={routing.locales} />
    </div>
  );
}
