"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";

// Cloudflare Turnstile, explicitly rendered. Placed inside a <form>, it adds a hidden
// `cf-turnstile-response` input that the server action verifies. With
// appearance "interaction-only" it stays invisible unless Cloudflare needs a click.

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

// One script tag and one promise shared by every widget on the page. (next/script dedupes a
// second <Script> with the same src and never calls its onReady, which left the second
// form without a widget.)
let scriptLoad: Promise<void> | undefined;

function loadTurnstile(): Promise<void> {
  scriptLoad ??= new Promise<void>((resolve, reject) => {
    if (window.turnstile) return resolve();
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoad = undefined; // let a later mount retry
      script.remove();
      reject(new Error("Turnstile script failed to load"));
    };
    document.head.appendChild(script);
  });
  return scriptLoad;
}

export type TurnstileHandle = { reset(): void };

type Props = {
  theme: "light" | "dark";
  language: string;
  ref?: Ref<TurnstileHandle>;
};

export function TurnstileWidget({ theme, language, ref }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!siteKey || !container) return;
    let cancelled = false;
    let id: string | undefined;

    loadTurnstile()
      .then(() => {
        if (cancelled || !window.turnstile) return;
        id = window.turnstile.render(container, {
          sitekey: siteKey,
          action: "waitlist",
          theme,
          language,
          size: "flexible",
          appearance: "interaction-only",
          "before-interactive-callback": () => setInteractive(true),
          "after-interactive-callback": () => setInteractive(false),
        });
        widgetId.current = id;
      })
      // No widget means no token; the server then answers with the error state.
      .catch((error: unknown) => console.error("[turnstile]", error));

    return () => {
      cancelled = true;
      if (id) window.turnstile?.remove(id);
      widgetId.current = undefined;
    };
  }, [siteKey, theme, language]);

  useImperativeHandle(ref, () => ({
    // Tokens are single-use, so every submit that doesn't end in success needs a new one.
    reset() {
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
    },
  }));

  if (!siteKey) return null;

  // 0px tall while invisible; the negative margin cancels the form's flex gap until a
  // challenge actually shows.
  return <div ref={containerRef} className={interactive ? undefined : "-mt-2"} />;
}
