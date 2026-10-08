import type { Metadata } from "next";
import { LanguageSwitcher } from "@/components/language-switcher";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;

  return {
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", es: "/es", "x-default": "/" },
    },
  };
}

// Placeholder until step 3 builds the header and sections.
export default function Home() {
  return (
    <main className="mx-auto max-w-[1200px] px-6 py-6">
      <LanguageSwitcher />
    </main>
  );
}
