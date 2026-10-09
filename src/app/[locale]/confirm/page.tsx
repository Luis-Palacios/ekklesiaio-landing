import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  HomeLink,
  StatusCard,
  StatusPage,
  statusButtonClass,
  statusPageMetadata,
} from "@/components/status-page";
import { SubmitButton } from "@/components/submit-button";
import { routing } from "@/i18n/routing";
import { confirmAction } from "@/server/confirm-action";
import { checkConfirmToken } from "@/server/subscription";
import { isToken } from "@/server/tokens";

// Confirm link from the email (docs/DESIGN.md §5.4). Opening it only shows a button;
// the button's POST confirms (see confirm-action.ts). `Cache-Control: no-store` and
// `X-Robots-Tag: noindex` for this path are set in next.config.ts.

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/confirm">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "email" });
  return statusPageMetadata(t("heading"));
}

export default function ConfirmPage({ searchParams }: PageProps<"/[locale]/confirm">) {
  return (
    <StatusPage>
      {/* The query string is request-time data; the header and footer stay static. */}
      <Suspense fallback={<div aria-busy="true" className="min-h-[280px] w-full max-w-[560px]" />}>
        <ConfirmCard searchParams={searchParams} />
      </Suspense>
    </StatusPage>
  );
}

async function ConfirmCard({ searchParams }: Pick<PageProps<"/[locale]/confirm">, "searchParams">) {
  const { token, error } = await searchParams;
  const [t, tEmail, tForm, locale] = await Promise.all([
    getTranslations("confirm"),
    getTranslations("email"),
    getTranslations("form"),
    getLocale(),
  ]);

  let state: Awaited<ReturnType<typeof checkConfirmToken>> = "invalid";
  let failed = error === "1";
  try {
    if (isToken(token)) state = await checkConfirmToken(token);
  } catch (err) {
    console.error("[confirm] token check failed:", err);
    // Still offer the button; its POST retries.
    state = "valid";
    failed = true;
  }

  if (state === "done") {
    return (
      <StatusCard success title={t("title")} body={t("body")}>
        <HomeLink>{t("back")}</HomeLink>
      </StatusCard>
    );
  }

  if (state === "invalid" || !isToken(token)) {
    return (
      <StatusCard title={t("invalidTitle")} body={t("invalidBody")}>
        <HomeLink hash="#waitlist">{t("back")}</HomeLink>
      </StatusCard>
    );
  }

  return (
    <StatusCard title={tEmail("heading")} body={tEmail("body")}>
      <form action={confirmAction} className="flex w-full flex-col gap-2">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="locale" value={locale} />
        <SubmitButton
          label={failed ? tForm("retry") : tEmail("button")}
          pendingLabel={t("loading")}
          className={`${statusButtonClass} cursor-pointer gap-2.5 self-start disabled:cursor-default disabled:opacity-80`}
        />
        <p role="status" className="m-0 min-h-[22px] text-sm text-danger">
          {failed ? tForm("serverError") : null}
        </p>
      </form>
    </StatusCard>
  );
}
