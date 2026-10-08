# ekklesiaio landing page — build spec

Pre-launch landing page for **ekklesiaio** (small-group reporting for churches) at **https://ekklesiaio.com**.
Single job: build awareness and collect waitlist emails, in **English and Spanish**.

This spec was written alongside the approved design. When this file and the design reference disagree on **behavior**, this file wins. When they disagree on **visual values**, the design reference wins.

| Source | What it's for |
|---|---|
| `docs/design/landing-page.dc.html` | The approved page: exact markup structure, inline styles (px values, colors, clamp() sizes), section order, and the full EN/ES copy. Open it in a browser to see it (it needs its runtime, so it may not render fully standalone; read it as source). |
| `docs/design/waitlist-states.dc.html` | The six form states. |
| `docs/design/social-card.dc.html` | The 1200×630 share card. Rebuild it with `next/og`. |
| `brand/theme.css` | Tailwind v4 `@theme` tokens. **Use these tokens; don't hard-code hex values in components.** |
| `messages/en.json`, `messages/es.json` | All copy. Keys mirror the design. **No user-facing string in components.** |
| `public/brand/*` | Logo files (see §3.4). |

---

## 1. Stack

Use the current stable versions at scaffold time, and check each library's current docs before using its API.

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript (strict)** | `src/` dir. Server Components by default. |
| Styling | **Tailwind CSS v4** | `@import "../brand/theme.css"` in `globals.css`. No CSS-in-JS. |
| i18n | **next-intl** | Locale-prefixed routing, `en` (default) and `es`. See §6. |
| Validation | **zod** | Shared schema for the form and the server action. |
| Database | **Postgres on Neon** via the Vercel Marketplace, using **Drizzle ORM** + `@neondatabase/serverless` | One table (§5.3). Migrations with drizzle-kit. |
| Email | **Resend** (domain already verified on Luis's DNS) + **React Email** templates | Transactional double opt-in now; the same contacts can be synced to Resend for the launch broadcast later. |
| Bot protection | **Cloudflare Turnstile** (managed / invisible mode) + a honeypot field | Verified server-side in the action. |
| Rate limiting | **Upstash Redis + `@upstash/ratelimit`** via the Vercel Marketplace | 5 submissions per IP per 10 min. |
| Analytics | **@vercel/analytics** | Track a `waitlist_submit` custom event with `{ locale, source }`. No cookies, so no consent banner needed for this. |
| Icons | Inline SVG components (paths are in the design file) | Don't add an icon library for the dozen icons used. |
| Hosting | **Vercel**; DNS on **Cloudflare** | Cloudflare records for Vercel should be **DNS only (grey cloud)**, not proxied. |

Don't add a component library (shadcn, etc.) for this page; the components are simple. Keep dependencies minimal.

## 2. Project structure

```
src/
  app/
    [locale]/
      layout.tsx            # <html lang>, fonts, NextIntlClientProvider, Analytics
      page.tsx              # the landing page (composes sections)
      confirm/page.tsx      # double opt-in landing (§5.4)
      unsubscribe/page.tsx
      privacy/page.tsx      # placeholder content, flagged as DRAFT (§9)
      opengraph-image.tsx   # per-locale share card via next/og (§7)
    globals.css
    sitemap.ts
    robots.ts
  components/
    site-header.tsx         # logo, nav, LanguageSwitcher, header CTA
    language-switcher.tsx
    waitlist-form.tsx       # "use client"; variant: "light" | "dark"; source: "hero" | "cta"
    sections/
      hero.tsx  problem.tsx  how-it-works.tsx  features.tsx
      ai-insights.tsx  philosophy.tsx  closing-cta.tsx  site-footer.tsx
    illustrations/
      reports-card.tsx      # hero product illustration (static, aria role="img")
      insights-card.tsx     # AI section illustration (static, aria role="img")
    icons.tsx
    logo.tsx                # <Logo variant="light|dark" />, <LogoMark />
  i18n/
    routing.ts  request.ts  navigation.ts
  middleware.ts             # next-intl middleware (locale detection, §6)
  server/
    waitlist-action.ts      # "use server"
    db/schema.ts  db/client.ts
    email/confirm-email.tsx # React Email template
    turnstile.ts  ratelimit.ts  tokens.ts
brand/theme.css
messages/en.json  messages/es.json
docs/DESIGN.md  docs/design/*
public/brand/*
```

## 3. Visual system

### 3.1 Tokens
Everything is in `brand/theme.css`. Key rules:

- **Gold never carries text on light backgrounds.** Use `gold-500` for fills, dots and underlines, and for buttons with **navy text** (8.6:1). For gold-looking text on light backgrounds, use `gold-800` (eyebrows) or `gold-900` (on gold tints).
- Body text is `ink`, secondary text is `muted`. `subtle` is decorative only.
- On navy sections, use white headings, `on-dark` body text, and `gold-500` for eyebrows and accents.
- Page background is `paper`. White sections and cards are `surface`. Tinted sections are `navy-50`.

### 3.2 Fonts (`next/font/google`)
- **Newsreader** (variable, with optical size): normal and italic, weights 400 and 500 → `--font-newsreader`. Used for all headings, the step numerals, the problem-list items and the mission/vision quotes. *Italic 400* is the emphasis style (`<em>` in headings).
- **Figtree**: 400, 500, 600, 700 → `--font-figtree`. Body and UI.
- **Inter**: 600 and 700 → `--font-inter`. **Only** for the wordmark text in the logo SVG (see §3.4). Load it with `display: "swap"` and a subset of `latin` only.

### 3.3 Layout rules
- Content container: `max-w-[1200px] mx-auto px-6`.
- Section vertical padding: `py-[clamp(64px,9vw,120px)]` (closing CTA: `clamp(72px,10vw,128px)`).
- Two-column blocks (hero, AI section, philosophy) are **flex-wrap** rows whose children have a flex-basis (520px/400px, 500px/420px, 460px/420px), so they stack naturally on narrow screens. Use the same values, or the equivalent `lg:grid-cols-2`; either works, as long as the phone layout matches the phone frames in the design.
- Card grids use `grid-cols-[repeat(auto-fit,minmax(min(Npx,100%),1fr))]` with N = 420 (problem, mission/vision), 240 (steps), 320 (features), 230 (AI items).
- Eyebrows: 13px, bold, `tracking-[0.08em]`, uppercase.
- Touch targets ≥ 44px. Inputs and buttons are 52px high.
- Header: sticky, `bg-paper/90 backdrop-blur border-b border-line`. Its items wrap on phones.

### 3.4 Logo
`public/brand/`:
- `logo-horizontal.svg`: mark + wordmark for light backgrounds (cropped viewBox `30 12 370 70`).
- `logo-horizontal-on-dark.svg`: the same lockup for navy backgrounds (white mark and "ekklesia" text).
- `icon.svg`: the navy rounded-square app icon. Use it for the **favicon** (`app/icon.svg`) and `apple-icon`.
- `icon-gold.svg`: the gold circle. Use it for social avatars.

The wordmark is **live `<text>` in Inter**, not outlined paths. Render the logo **inline** (as a React component) so it uses the page's loaded Inter via `var(--font-inter)`. Don't use `<img src="logo.svg">`, because an `<img>` can't use web fonts and falls back to Arial. *TODO (Luis): export an outlined version of the wordmark from a vector editor; then `<img>`/`next/image` becomes fine everywhere.*

## 4. Page anatomy (top → bottom)

Every string below comes from `messages/*.json` (key in brackets). Visual details are in `docs/design/landing-page.dc.html`.

1. **Header**: logo (links to `#top`), nav links [`nav.how` → `#how-it-works`, `nav.features` → `#features`, `nav.ai` → `#ai-insights`], **LanguageSwitcher** (§6.3), header CTA [`nav.cta`] → `#waitlist` (navy button).
2. **Hero** (`#top`): "Coming soon" badge [`hero.badge`] + tagline; H1 = `hero.titleA` + `<em>` `hero.titleEm` (italic, with a gold underline at 0.08em thickness and 0.12em offset); two paragraphs; **WaitlistForm** (`id="waitlist"`, variant light, source `hero`); "See how it works" link + "No spam" note. Right column: `ReportsCard` illustration.
3. **Problem**: eyebrow, H2, intro; two panels: "In your groups" (white-ish, Newsreader 24px list with gold dots) and "What reaches leadership" (navy-50, lead line + dash list); closing line with a gold cross icon.
4. **How it works** (`#how-it-works`, navy section): eyebrow (gold), H2 (white), an `<ol>` of 4 steps with gold Newsreader numerals and a top border at `white/18`.
5. **Features** (`#features`): eyebrow, H2, six cards (white, border, 48px navy-100 icon tile).
6. **AI-assisted insights** (`#ai-insights`, navy-50 section): eyebrow, H2 with an italic tail, intro, 4 items (2×2), then a **trust list** of 3 items (optional / leaders decide / privacy) with gold-800 icons. Right column: `InsightsCard` illustration.
7. **Philosophy**: H2 with an italic tail + two paragraphs; then the Mission and Vision panels (Newsreader quote text).
8. **Closing CTA** (navy): white logo mark, H2 with a gold italic tail, body, **WaitlistForm** (variant dark, source `cta`, button `form.ctaButton`).
9. **Footer** (navy-950): wordmark (HTML text in Inter), © year, links [`footer.privacy` → `/[locale]/privacy`, `footer.contact` → `mailto:` the `CONTACT_EMAIL` env var].

The two illustrations are **static decorative mockups** with sample data (`role="img"` + `aria-label`). Their text is translated (keys `mock.*`, `card.*`, `groups.*`). Don't make them interactive.

## 5. Waitlist

### 5.1 Form (`waitlist-form.tsx`, client component)
- Uses `useActionState` with the server action. It's a real `<form action={…}>`, so it works without JavaScript.
- Fields: `email` (type email, `autocomplete="email"`, visible `<label>`), hidden `locale`, hidden `source`, the Turnstile token, and a **honeypot** text input (`name="company"`, visually hidden, `tabIndex={-1}`, `autoComplete="off"`, labelled `form.honeypotLabel`).
- Client-side zod check before submitting, so the error shows instantly. The server re-validates.
- The message area is `role="status"` / `aria-live="polite"`, and the input gets `aria-invalid` + `aria-describedby` on error.

### 5.2 States (see `docs/design/waitlist-states.dc.html`)
| State | UI |
|---|---|
| idle | Default |
| focused | Navy border + gold focus halo (`shadow-focus`). Use `focus-visible` on buttons and links too. |
| submitting | Input and button disabled, button shows a spinner + `form.loading` (hero) or `form.ctaLoading` (CTA). |
| invalid email | Red border (`danger`, or `danger-on-dark` in the CTA) + `form.invalid` |
| success | The form is replaced by the success box [`form.successTitle`, `form.successBody`] |
| server error | `form.serverError`; the button reads `form.retry` |

**No enumeration:** a new email, a pending email and an already-confirmed email all show **the same success state**.

### 5.3 Server action (`server/waitlist-action.ts`)
1. Parse the `FormData` with zod. Normalize the email (`trim`, lowercase).
2. If the honeypot is filled → return `success` without doing anything.
3. Verify the Turnstile token (`TURNSTILE_SECRET_KEY`). On failure → `error`.
4. Rate limit by IP (`x-forwarded-for`), 5 per 10 min. If over the limit → `error`.
5. Upsert into `waitlist_signups`:
   - new → insert `pending` with a fresh confirm token (store **only its SHA-256 hash**), and send the confirmation email.
   - existing `pending` → rotate the token and resend the email, but at most once per 10 minutes.
   - existing `confirmed` → do nothing.
   - existing `unsubscribed` → set back to `pending` and send the confirmation email.
6. Track the `waitlist_submit` analytics event. Return `{ status: "success" }`.

```ts
// server/db/schema.ts (Drizzle)
waitlist_signups (
  id               uuid pk default gen_random_uuid(),
  email            text not null unique,          -- stored lowercase
  locale           text not null,                 -- 'en' | 'es'
  source           text not null,                 -- 'hero' | 'cta'
  status           text not null default 'pending', -- 'pending' | 'confirmed' | 'unsubscribed'
  confirm_token_hash text,
  confirm_sent_at  timestamptz,
  confirmed_at     timestamptz,
  unsubscribe_token text not null,                -- random, URL-safe, stable
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
)
```

### 5.4 Double opt-in
- Email (React Email, `server/email/confirm-email.tsx`), in the **signup's locale**, using the `email.*` keys. It's simple and on-brand: logo, heading, body, a navy button linking to `https://ekklesiaio.com/{locale}/confirm?token=…`, the ignore note, and an unsubscribe link. From: the `EMAIL_FROM` env var (e.g. `ekklesiaio <hello@ekklesiaio.com>`). Include a `List-Unsubscribe` header.
- Tokens expire after **72 hours**.
- `/[locale]/confirm`: valid token → mark `confirmed`, clear the hash, show `confirm.title` / `confirm.body`. Invalid or expired → `confirm.invalidTitle` / `confirm.invalidBody` with a link back to `/#waitlist`. Same visual shell as the landing page (header + a centered card on paper + footer).
- `/[locale]/unsubscribe?token=…` → set `unsubscribed` and show `unsubscribe.*`.
- Pages that use tokens must be `noindex`.

## 6. Internationalization

### 6.1 Routing
- next-intl with `locales: ['en','es']`, `defaultLocale: 'en'`, `localePrefix: 'always'`, so URLs are `/en`, `/es`, `/es/confirm`, etc.
- `/` → middleware redirects to the best locale.

### 6.2 Detection order (handled by next-intl middleware)
1. The `NEXT_LOCALE` cookie (set when the user picks a language)
2. The `Accept-Language` header → any `es-*` maps to `es`, anything else to `en`
3. `en` as the fallback

### 6.3 Language switcher
- A segmented control: a globe icon followed by **EN | ES** buttons. The active one is a navy fill with white text; the other is transparent with `ink` text. Its container has a 1px `line-strong` border, a 10px radius and a white fill (see the design).
- Implement the options as **links** to the same path in the other locale (next-intl `Link` with `locale`), so it works without JavaScript and crawlers see both URLs. Give each link `lang`, `hrefLang`, and an `aria-label` of "English"/"Español", and mark the current one `aria-current="true"`.
- Choosing a language persists the `NEXT_LOCALE` cookie (next-intl does this).

### 6.4 SEO
- `<html lang>` = the current locale.
- `generateMetadata` per locale: `meta.title`, `meta.description`, `alternates.canonical`, and `alternates.languages` = `{ en: '/en', es: '/es', 'x-default': '/' }` (hreflang).
- `sitemap.ts` lists `/en`, `/es` and `/en|es/privacy` with alternates. `robots.ts` allows all and disallows `/*/confirm` and `/*/unsubscribe`.

## 7. Share image
`app/[locale]/opengraph-image.tsx` uses `ImageResponse` (1200×630) to rebuild `docs/design/social-card.dc.html` per locale:

- **Background:** navy.
- **Top row:** the gold circle icon and the "ekklesia" + gold "io" wordmark on the left, a gold-outlined "Coming soon" pill on the right.
- **Headline:** Newsreader 88px, with the italic tail in gold.
- **Subline:** `on-dark` 28px.
- **Decoration:** a large faint (8% white) logo mark in the bottom-right corner.

Load the fonts as ArrayBuffers for `ImageResponse`. Set `alt` from `meta.ogAlt`. The badge text comes from `hero.badge`, the headline from `hero.titleA` + `hero.titleEm`, and the subline from `og.subline`.

## 8. Accessibility checklist
- Exactly one `h1` per page, with sections labelled by their `h2` (`aria-labelledby`).
- Real `<button>`, `<a>`, `<label>`. Focus is visible everywhere (gold halo or a 2px navy outline).
- Contrast: follow the token rules in §3.1; they're pre-checked.
- `prefers-reduced-motion`: no animations are required. If you add any, disable them under that setting.
- Decorative SVGs get `aria-hidden="true"`. Each illustration card gets `role="img"` plus a translated `aria-label`.

## 9. Open items for Luis (don't invent these)
- [ ] **Privacy policy text.** Build `/[locale]/privacy` with a clearly marked DRAFT notice (`privacy.draftNotice`) and a short list of facts only: what is collected (email, language, signup source), why (launch updates), the provider list (Vercel, Neon, Resend, Cloudflare), how to unsubscribe, the contact email, and that reports and data are never used to train AI models. Luis reviews and finalizes it.
- [ ] `CONTACT_EMAIL` and `EMAIL_FROM` addresses.
- [ ] An outlined wordmark SVG (§3.4).
- [ ] Replace the illustration cards with real screenshots once the staff app is restyled (optional).

## 10. Environment variables
```
NEXT_PUBLIC_SITE_URL=https://ekklesiaio.com
DATABASE_URL=                      # Neon (Vercel Marketplace sets it)
RESEND_API_KEY=
EMAIL_FROM="ekklesiaio <hello@ekklesiaio.com>"
CONTACT_EMAIL=hello@ekklesiaio.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```
Commit a `.env.example`. Never commit real values.

## 11. Suggested build order (one PR / commit series each)
1. **Scaffold:** Next.js + TS + Tailwind v4 + `brand/theme.css` + fonts + ESLint/Prettier; deploy an empty page to Vercel.
2. **i18n:** next-intl routing, middleware, messages, LanguageSwitcher, metadata and hreflang.
3. **Static page:** header, every section, footer, both illustrations, logo components. Match the design at 1440px and 390px.
4. **Waitlist:** DB schema + migration, server action, form states, Turnstile, rate limit.
5. **Email:** React Email template, Resend send, the confirm and unsubscribe pages.
6. **Polish:** OG images, sitemap/robots, analytics event, accessibility pass, Lighthouse (target ≥ 95 on every category).

Testing: unit-test the zod schema and the action's branches (new, pending, confirmed, unsubscribed, honeypot, rate-limited) with Vitest and a mocked DB and Resend. Add one Playwright smoke test per locale: the page loads, the language switch works, and invalid then valid email submission shows the right states.
