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
      className="inline-flex items-center gap-0.5 rounded-control border border-line-strong bg-surface p-[3px] sm:pl-2.5"
    >
      <GlobeIcon className="mr-1 hidden size-4 text-muted sm:block" />
      <LocaleLinks locales={routing.locales} />
    </div>
  );
}
