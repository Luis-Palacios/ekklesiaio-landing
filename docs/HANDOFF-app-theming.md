# Handoff — theming the ekklesiaio staff app (next session)

Written 2026-10-09 at the end of the landing-page session. Read this first.

## Where things stand
- **Landing page is live** at https://ekklesiaio.com (bare domain is primary; www 308-redirects). Repo: this folder (`landing-page`, GitHub `Luis-Palacios/ekklesiaio-landing`), Next.js 16 + TypeScript + Tailwind v4 + next-intl (EN/ES), Vercel Hobby.
- Built in 6 stages by Claude Code from `docs/DESIGN.md`, each stage reviewed by Claude (Cowork). Waitlist: Neon Postgres + Drizzle, Resend double opt-in (confirm requires POST), Turnstile (invisible), Upstash rate limit, daily cron purging unconfirmed sign-ups > 30 days, build-time migrations, per-PR Neon preview branches.
- Approved privacy policy (EN/ES): `docs/privacy-policy.md`. Effective Oct 9, 2026. Click tracking ON in Resend, open tracking OFF.
- Social accounts: facebook.com/ekklesiaio · x.com/EkklesiaIO · linkedin.com/company/ekklesiaio. Social assets + launch captions done.
- **Open item:** mobile header fix (hide section nav below `md`, one row ≤ 72px) was in progress in Claude Code — verify at 390px/360px in both languages.

## Design sources
- **Design canvas** (Claude Design): https://claude.ai/artifact/Ap3dfFe1QwaRd1DSjKLc6s — pages "Landing page" (desktop, phones EN/ES, waitlist states, share card) and "Social media".
- **Brand tokens:** `brand/theme.css` (Tailwind v4 `@theme`). Navy `#0B2341`, gold `#F2B544`; gold never carries text on light backgrounds (use `gold-800`/`gold-900`); body `ink #33445A`, secondary `muted #56667A`, paper `#FBFAF7`.
- **Type:** Newsreader (display/headings, italic 400 for emphasis), Figtree (UI/body), Inter (logo wordmark only).
- **Logos:** `public/brand/` (horizontal light/dark, `icon.svg` navy app icon, `icon-gold.svg`). Mark is centered with `translate(6 20.575) scale(1.1)` in a 100-unit viewBox. Wordmark is live Inter text (outline it someday).
- Voice: warm, plain, pastoral; Spanish uses formal *usted*; "grupos pequeños".

## Next task: restyle the staff app
The SaaS lives in sibling repos under `members-management/` (Python FastAPI service, TypeScript auth server, **Next.js staff app**). It predates this brand.

Plan agreed earlier:
1. **Read the staff app's real code first** (components, Tailwind config, key screens) — connect the `members-management` folder (or the staff-app repo) in the new session.
2. Share the brand: copy `brand/theme.css` into the staff app (later maybe a shared package); map its existing colors/fonts to the tokens.
3. Redesign 2–3 key screens on a canvas from the real source — likely report submission (leader), leadership dashboard, group detail — plus app-specific components the landing page never needed (tables, nav/sidebar, badges/status, empty states, dense forms; decide on dark mode).
4. Approve the look, then hand a spec to Claude Code to apply screen by screen; Claude reviews each stage.
5. Afterwards, formalize a **Design System** artifact from landing + app components.

## AI features to keep in mind (product promises already on the site)
Summaries, tone per group (encouraged / steady / needs care), "Pay attention to…", suggested prayer requests — **always optional, human review before anything is shared, church data never used to train AI models** (needs a church-level AI on/off switch).
