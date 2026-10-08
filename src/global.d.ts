import type messages from "../messages/en.json";
import type { routing } from "./i18n/routing";

// The parts of Cloudflare Turnstile's explicit-render API that the waitlist form uses.
declare global {
  interface Window {
    turnstile?: {
      render(container: HTMLElement, options: Record<string, unknown>): string | undefined;
      reset(widgetId: string): void;
      remove(widgetId: string): void;
    };
  }
}

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
