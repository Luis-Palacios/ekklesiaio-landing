import type { Metadata } from "next";
import { hasLocale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { HomeLink, StatusCard, StatusPage, statusPageMetadata } from "@/components/status-page";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/confirm/invalid">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "confirm" });
  return statusPageMetadata(t("invalidTitle"));
}

export default function ConfirmInvalidPage() {
  const t = useTranslations("confirm");

  return (
    <StatusPage>
      <StatusCard title={t("invalidTitle")} body={t("invalidBody")}>
        <HomeLink hash="#waitlist">{t("back")}</HomeLink>
      </StatusCard>
    </StatusPage>
  );
}
