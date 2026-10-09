import type { Metadata } from "next";
import { hasLocale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { HomeLink, StatusCard, StatusPage, statusPageMetadata } from "@/components/status-page";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/unsubscribe/done">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "unsubscribe" });
  return statusPageMetadata(t("title"));
}

export default function UnsubscribeDonePage() {
  const t = useTranslations("unsubscribe");

  return (
    <StatusPage>
      <StatusCard success title={t("title")} body={t("body")}>
        <HomeLink>{t("back")}</HomeLink>
      </StatusCard>
    </StatusPage>
  );
}
