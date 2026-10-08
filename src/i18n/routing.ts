import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  localePrefix: "always",
  // Persist an explicit language choice across visits (default is a session cookie).
  localeCookie: { maxAge: 60 * 60 * 24 * 365 },
  // hreflang comes from generateMetadata (single source, correct on preview domains).
  alternateLinks: false,
});

// Autonyms: each language is named in its own language, whatever the page locale.
export const localeNames = { en: "English", es: "Español" } as const satisfies Record<
  (typeof routing.locales)[number],
  string
>;
