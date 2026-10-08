"use client";

import Script from "next/script";
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";

// Cloudflare Turnstile, explicitly rendered. Placed inside a <form>, it adds a hidden
// `cf-turnstile-response` input that the server action verifies. With
// appearance "interaction-only" it stays invisible unless Cloudflare needs a click.

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

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
  const [ready, setReady] = useState(false);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!ready || !siteKey || !container || !window.turnstile) return;
    const id = window.turnstile.render(container, {
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
    return () => {
      if (id) window.turnstile?.remove(id);
      widgetId.current = undefined;
    };
  }, [ready, siteKey, theme, language]);

  useImperativeHandle(ref, () => ({
    // Tokens are single-use, so every submit that doesn't end in success needs a new one.
    reset() {
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
    },
  }));

  if (!siteKey) return null;

  return (
    <>
      {/* onReady fires on load and again for each later mount, so both forms render a widget. */}
      <Script src={SCRIPT_SRC} strategy="afterInteractive" onReady={() => setReady(true)} />
      {/* 0px tall while invisible; the negative margin cancels the form's flex gap until a
          challenge actually shows. */}
      <div ref={containerRef} className={interactive ? undefined : "-mt-2"} />
    </>
  );
}
