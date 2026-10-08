import { useTranslations } from "next-intl";
import {
  AlarmIcon,
  BellIcon,
  ChecklistIcon,
  ClipboardCheckIcon,
  EyeIcon,
  UsersIcon,
} from "../icons";
import { container, Eyebrow, sectionPadding, sectionTitle } from "../typography";

const features = [
  { Icon: UsersIcon, title: "f1t", body: "f1b" },
  { Icon: ClipboardCheckIcon, title: "f2t", body: "f2b" },
  { Icon: AlarmIcon, title: "f3t", body: "f3b" },
  { Icon: BellIcon, title: "f4t", body: "f4b" },
  { Icon: ChecklistIcon, title: "f5t", body: "f5b" },
  { Icon: EyeIcon, title: "f6t", body: "f6b" },
] as const;

export function Features() {
  const t = useTranslations("features");

  return (
    <section id="features" aria-labelledby="features-title" className={sectionPadding}>
      <div className={`${container} flex flex-col gap-12`}>
        <div className="flex max-w-[760px] flex-col gap-4">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 id="features-title" className={`${sectionTitle} text-navy-900`}>
            {t("title")}
          </h2>
        </div>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-5 p-0">
          {features.map(({ Icon, title, body }) => (
            <li
              key={title}
              className="flex flex-col gap-3.5 rounded-card border border-line bg-surface p-7"
            >
              <span className="flex size-12 items-center justify-center rounded-tile bg-navy-100">
                <Icon className="size-6 text-navy-900" />
              </span>
              <h3 className="m-0 text-[19px] font-bold text-navy-900">{t(title)}</h3>
              <p className="m-0 text-base text-ink">{t(body)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
