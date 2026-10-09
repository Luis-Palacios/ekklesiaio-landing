"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { emailSchema, type WaitlistSource, type WaitlistState } from "@/lib/waitlist-schema";
import { joinWaitlist } from "@/server/waitlist-action";
import { CheckIcon, SpinnerIcon } from "./icons";
import { TurnstileWidget, type TurnstileHandle } from "./turnstile-widget";

// States: docs/design/waitlist-states.dc.html (idle, focused, submitting, invalid,
// success, server error). A real <form action>, so it also posts without JavaScript.

type Props = {
  variant: "light" | "dark";
  source: WaitlistSource;
};

const styles = {
  light: {
    label: "text-navy-900",
    input: "border-field focus:border-navy-900",
    inputError: "border-danger",
    button: "px-[22px]",
    message: "text-muted",
    messageError: "text-danger",
    success: "border-navy-900 bg-surface",
    successIcon: "bg-navy-900 text-gold-500",
    successTitle: "text-navy-900",
    successBody: "text-ink",
  },
  dark: {
    label: "text-white",
    input: "border-white",
    inputError: "border-danger-on-dark",
    button: "px-6",
    message: "text-on-dark",
    messageError: "text-danger-on-dark",
    success: "border-gold-500 bg-navy-800",
    successIcon: "bg-gold-500 text-navy-900",
    successTitle: "text-white",
    successBody: "text-on-dark",
  },
} as const;

const initialState: WaitlistState = { status: "idle" };

// How long a submit waits for Turnstile to issue a token before sending without one
// (the server then answers with the error state).
const TOKEN_WAIT_MS = 5000;

export function WaitlistFormClient({ variant, source }: Props) {
  const t = useTranslations("form");
  const locale = useLocale();
  const [state, formAction, actionPending] = useActionState(joinWaitlist, initialState);
  // True while a submit waits for the Turnstile token; shown like the action's pending state.
  const [waiting, setWaiting] = useState(false);
  const pending = actionPending || waiting;
  // Client-side check result, and whether the email was edited since the last server result
  // (typing clears the error, as in the design).
  const [clientInvalid, setClientInvalid] = useState(false);
  const [edited, setEdited] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const turnstile = useRef<TurnstileHandle>(null);

  const s = styles[variant];
  const isHero = source === "hero";
  const inputId = `${source}-email`;
  const messageId = `${source}-msg`;

  const invalid = !pending && (clientInvalid || (state.status === "invalid" && !edited));
  const serverError = !pending && !invalid && state.status === "error" && !edited;

  useEffect(() => {
    if (state.status === "success") successRef.current?.focus();
    else if (state.status !== "idle") turnstile.current?.reset();
  }, [state]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // With JS, submits are dispatched here (so they can wait for the token); without
    // it, the form still posts to the action natively.
    event.preventDefault();
    const email = inputRef.current?.value ?? "";
    if (!emailSchema.safeParse(email).success) {
      setClientInvalid(true);
      inputRef.current?.focus();
      return;
    }
    setClientInvalid(false);
    setEdited(false);

    // Read the fields now: disabled inputs (while waiting) are left out of FormData.
    const formData = new FormData(event.currentTarget);
    if (!formData.get("cf-turnstile-response")) {
      setWaiting(true);
      const token = await turnstile.current?.waitForToken(TOKEN_WAIT_MS);
      if (token) formData.set("cf-turnstile-response", token);
    }
    startTransition(() => {
      // Inside the transition, so the form stays busy until the action's result lands.
      setWaiting(false);
      formAction(formData);
    });
  }

  if (state.status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className={`flex items-start gap-3.5 rounded-tile border-[1.5px] px-5 py-[18px] outline-none ${s.success}`}
      >
        <span
          className={`flex size-8 flex-none items-center justify-center rounded-full ${s.successIcon}`}
        >
          <CheckIcon className="size-[18px]" />
        </span>
        <div className="flex flex-col gap-0.5">
          <strong className={`text-[17px] ${s.successTitle}`}>{t("successTitle")}</strong>
          <span className={`text-[15px] ${s.successBody}`}>{t("successBody")}</span>
        </div>
      </div>
    );
  }

  const defaultValue = state.status === "idle" ? "" : state.email;
  const buttonLabel = pending
    ? t(isHero ? "loading" : "ctaLoading")
    : serverError
      ? t("retry")
      : t(isHero ? "heroButton" : "ctaButton");

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
      <label htmlFor={inputId} className={`text-sm font-semibold ${s.label}`}>
        {t(isHero ? "heroLabel" : "ctaLabel")}
      </label>
      <div className="flex flex-wrap gap-2.5">
        <input
          ref={inputRef}
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          defaultValue={defaultValue}
          placeholder={t("placeholder")}
          disabled={pending}
          aria-invalid={invalid || undefined}
          aria-describedby={messageId}
          onChange={() => {
            setClientInvalid(false);
            setEdited(true);
          }}
          className={`h-[52px] min-w-0 flex-[1_1_240px] rounded-control border-[1.5px] bg-surface px-4 text-base text-navy-900 outline-none focus:shadow-focus disabled:bg-field-disabled disabled:text-muted ${invalid ? s.inputError : s.input}`}
        />
        <button
          type="submit"
          disabled={pending}
          className={`flex h-[52px] flex-none cursor-pointer items-center justify-center gap-2.5 rounded-control bg-gold-500 text-base font-bold text-navy-900 outline-none focus-visible:shadow-focus disabled:cursor-default disabled:bg-gold-300 ${s.button}`}
        >
          {pending && (
            <SpinnerIcon className="size-[18px] animate-spin motion-reduce:animate-none" />
          )}
          <span>{buttonLabel}</span>
        </button>
      </div>

      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="source" value={source} />
      {/* Honeypot: hidden from people and assistive tech; bots that fill it get a fake success. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor={`${source}-company`}>{t("honeypotLabel")}</label>
        <input
          id={`${source}-company`}
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <TurnstileWidget ref={turnstile} theme={variant} language={locale} />

      <div
        id={messageId}
        role="status"
        className={`min-h-[22px] text-sm ${invalid || serverError ? s.messageError : s.message}`}
      >
        {invalid ? t("invalid") : serverError ? t("serverError") : null}
      </div>
    </form>
  );
}
