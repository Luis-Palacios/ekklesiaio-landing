import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { BellIcon, CheckIcon } from "../icons";

// Static decorative mockup of the reports view (DESIGN.md §4). role="img" makes
// the contents presentational; the aria-label describes it.

// Sample proper names, the same in every locale.
const leaders = { g1: "Daniel R.", g2: "Ana M.", g3: "Carlos P." } as const;

function Chip({ tone, children }: { tone: "navy" | "gold"; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-semibold whitespace-nowrap ${
        tone === "navy" ? "bg-navy-100 text-navy-900" : "bg-gold-100 text-gold-900"
      }`}
    >
      {children}
    </span>
  );
}

function GroupRow({
  name,
  detail,
  status,
  last = false,
}: {
  name: string;
  detail: string;
  status: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 px-[22px] py-3.5 ${
        last ? "" : "border-b border-line-subtle"
      }`}
    >
      <div className="flex min-w-0 flex-col">
        <span className="text-[15px] font-semibold text-navy-900">{name}</span>
        <span className="text-[13px] text-muted">{detail}</span>
      </div>
      {status}
    </div>
  );
}

export function ReportsCard() {
  const t = useTranslations();

  const submitted = (
    <Chip tone="navy">
      <CheckIcon className="size-3.5" />
      {t("mock.submitted")}
    </Chip>
  );

  return (
    <div
      role="img"
      aria-label={t("mock.aria")}
      className="w-full max-w-[480px] overflow-hidden rounded-panel border border-line bg-surface shadow-float"
    >
      <div className="flex flex-col gap-3.5 border-b border-line-subtle px-[22px] pt-5 pb-4">
        <div className="flex items-center justify-between gap-3">
          <strong className="text-base text-navy-900">{t("mock.title")}</strong>
          <span className="text-[13px] text-muted">{t("mock.week")}</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-2 overflow-hidden rounded-full bg-line-subtle">
            <div className="h-full w-3/4 rounded-full bg-navy-900" />
          </div>
          <span className="text-[13px] text-muted">{t("mock.progress")}</span>
        </div>
      </div>

      <div className="flex flex-col">
        <GroupRow
          name={t("groups.g1")}
          detail={`${t("mock.leader")} ${leaders.g1}`}
          status={submitted}
        />
        <GroupRow
          name={t("groups.g2")}
          detail={`${t("mock.leader")} ${leaders.g2} · ${t("mock.prayerCount")}`}
          status={submitted}
        />
        <GroupRow
          name={t("groups.g3")}
          detail={`${t("mock.leader")} ${leaders.g3}`}
          status={
            <Chip tone="gold">
              <BellIcon className="size-3.5" strokeWidth={2} />
              {t("mock.reminder")}
            </Chip>
          }
          last
        />
      </div>

      <div className="mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-tile border border-gold-200 bg-gold-50 p-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-xs font-bold tracking-[0.06em] text-gold-900 uppercase">
            {t("mock.needs")}
          </span>
          <span className="text-[15px] font-semibold text-navy-900">{t("mock.needsItem")}</span>
        </div>
        <span className="inline-flex items-center rounded-lg bg-navy-900 px-3 py-2 text-[13px] font-semibold text-white">
          {t("mock.assign")}
        </span>
      </div>
    </div>
  );
}
