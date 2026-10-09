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
import { checkUnsubscribeToken } from "@/server/subscription";
import { isToken } from "@/server/tokens";
import { unsubscribeAction } from "@/server/unsubscribe-action";

// Unsubscribe link from the email (docs/DESIGN.md §5.4). Opening it only shows a
// button; the button's POST unsubscribes (see unsubscribe-action.ts).

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/unsubscribe">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "unsubscribe" });
  return statusPageMetadata(t("promptTitle"));
}

export default function UnsubscribePage({ searchParams }: PageProps<"/[locale]/unsubscribe">) {
  return (
    <StatusPage>
      {/* The query string is request-time data; the header and footer stay static. */}
      <Suspense fallback={<div aria-busy="true" className="min-h-[280px] w-full max-w-[560px]" />}>
        <UnsubscribeCard searchParams={searchParams} />
      </Suspense>
    </StatusPage>
  );
}

async function UnsubscribeCard({
  searchParams,
}: Pick<PageProps<"/[locale]/unsubscribe">, "searchParams">) {
  const { token, error } = await searchParams;
  const [t, tForm, locale] = await Promise.all([
    getTranslations("unsubscribe"),
    getTranslations("form"),
    getLocale(),
  ]);

  let state: Awaited<ReturnType<typeof checkUnsubscribeToken>> = "invalid";
  let failed = error === "1";
  try {
    if (isToken(token)) state = await checkUnsubscribeToken(token);
  } catch (err) {
    console.error("[unsubscribe] token check failed:", err);
    // Still offer the button; its POST retries the lookup.
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
        <HomeLink>{t("back")}</HomeLink>
      </StatusCard>
    );
  }

  return (
    <StatusCard title={t("promptTitle")} body={t("promptBody")}>
      <form action={unsubscribeAction} className="flex w-full flex-col gap-2">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="locale" value={locale} />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <SubmitButton
            label={failed ? tForm("retry") : t("button")}
            pendingLabel={t("loading")}
            className={`${statusButtonClass} cursor-pointer gap-2.5 disabled:cursor-default disabled:opacity-80`}
          />
          <a
            href={`/${locale}`}
            className="rounded-sm text-[15px] font-medium text-ink underline underline-offset-[3px] outline-none hover:text-navy-900 focus-visible:shadow-focus"
          >
            {t("back")}
          </a>
        </div>
        <p role="status" className="m-0 min-h-[22px] text-sm text-danger">
          {failed ? tForm("serverError") : null}
        </p>
      </form>
    </StatusCard>
  );
}
