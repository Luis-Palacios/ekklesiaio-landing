# ekklesiaio — landing page

Pre-launch, bilingual (EN/ES) landing page with an email waitlist for ekklesiaio, a small-group reporting SaaS for churches. Production: https://ekklesiaio.com (Vercel; DNS on Cloudflare).

## Read first
- **`docs/DESIGN.md`** is the build spec: stack, structure, behavior, waitlist flow, i18n, build order. Follow it.
- **`docs/design/*.dc.html`** hold the approved design as source. Take exact visual values from them: spacing, sizes, colors, clamp() values, and structure. These files are design references, not app code: don't import them, and don't copy their `{{…}}` template syntax or `DCLogic` scripts.
- **`brand/theme.css`** holds the Tailwind v4 tokens. Use the token utilities (`bg-navy-900`, `text-ink`, `font-display`, `rounded-control`…), not raw hex.
- **`messages/en.json` / `messages/es.json`** hold all copy. Never hard-code user-facing text, and keep both files' keys identical.

## Ground rules
- TypeScript strict, Server Components by default; add `"use client"` only where needed (waitlist form, Turnstile).
- Check current library docs (Next.js, next-intl, Tailwind v4, Drizzle, Resend, Upstash, Turnstile) before using an API. Don't rely on memory for version-specific details.
- Keep dependencies minimal, and don't add a UI kit or icon library.
- Accessibility is a requirement, not polish: labels, focus states, contrast rules from DESIGN.md §3.1 and §8.
- Never commit secrets. Keep `.env.example` up to date.
- Copy changes: edit both locale files. If a Spanish string is missing, add an English placeholder prefixed `[ES TODO]` and say so in the PR, rather than machine-translating silently.
- Don't invent legal or policy text, prices, dates, or stats. Use the open items list in DESIGN.md §9.

## Scaffolding note
This folder already has files (docs, brand, messages, public/brand, icons), and `create-next-app` refuses non-empty folders. Scaffold into a temporary sibling folder and move the generated files in, without overwriting anything listed here. `icons/` holds the original logo files; `public/brand/` holds the cleaned copies the app uses.

## Commands
(fill in after scaffolding: dev, build, lint, typecheck, test, e2e, db:generate, db:migrate)
