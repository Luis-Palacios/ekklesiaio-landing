import type { Metadata } from "next";
import { AiInsights } from "@/components/sections/ai-insights";
import { ClosingCta } from "@/components/sections/closing-cta";
import { Features } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Philosophy } from "@/components/sections/philosophy";
import { Problem } from "@/components/sections/problem";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/site-header";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;

  return {
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", es: "/es", "x-default": "/" },
    },
  };
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <Hero />
        <Problem />
        <HowItWorks />
        <Features />
        <AiInsights />
        <Philosophy />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
