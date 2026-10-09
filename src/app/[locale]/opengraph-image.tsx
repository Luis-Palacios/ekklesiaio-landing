import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ImageResponse } from "next/og";
import { MarkPaths } from "@/components/logo";
import { routing } from "@/i18n/routing";

// The share card (docs/design/social-card.dc.html), one per locale. Satori can't read
// CSS variables, so these copy hex values from brand/theme.css: keep them in sync.
const NAVY_900 = "#0B2341";
const GOLD_500 = "#F2B544";
const ON_DARK = "#C3CDDA";
const WHITE = "#FFFFFF";

const size = { width: 1200, height: 630 };

// next/root-params doesn't work in metadata routes, so the locale comes from params.
// One image per locale; generateImageMetadata is what lets its alt text be translated.
export async function generateImageMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: localeOf(params.locale), namespace: "meta" });
  return [{ id: "card", alt: t("ogAlt"), size, contentType: "image/png" }];
}

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = localeOf((await params).locale);
  const [tHero, tOg] = await Promise.all([
    getTranslations({ locale, namespace: "hero" }),
    getTranslations({ locale, namespace: "og" }),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "72px 80px",
        background: NAVY_900,
        fontFamily: "Figtree",
        color: WHITE,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Faint mark in the corner. */}
      <svg
        width="520"
        height="520"
        viewBox="0 0 100 100"
        style={{ position: "absolute", right: -90, bottom: -120, opacity: 0.08 }}
      >
        <g transform="translate(10 10)">
          <MarkPaths color={WHITE} crossColor={WHITE} />
        </g>
      </svg>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="64" height="64" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill={GOLD_500} />
            <g transform="translate(6 20.575) scale(1.1)">
              <MarkPaths color={NAVY_900} crossColor={NAVY_900} />
            </g>
          </svg>
          {/* The design asks for weight 650; the static font file is 600. */}
          <div
            style={{
              display: "flex",
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: 40,
              letterSpacing: "-0.04em",
            }}
          >
            <span>ekklesia</span>
            <span style={{ color: GOLD_500 }}>io</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 18px",
            borderRadius: 999,
            border: `1.5px solid ${GOLD_500}`,
            color: GOLD_500,
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 999, background: GOLD_500 }} />
          <span>{tHero("badge")}</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
        {/* Satori has no inline layout: one flex item per word, so lines wrap between words. */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            fontFamily: "Newsreader",
            fontWeight: 500,
            fontSize: 88,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {words(tHero("titleA")).map((word, i) => (
            <span key={`a${i}`} style={{ whiteSpace: "pre" }}>
              {word}
            </span>
          ))}
          {words(tHero("titleEm")).map((word, i) => (
            <span
              key={`em${i}`}
              style={{ whiteSpace: "pre", fontStyle: "italic", fontWeight: 400, color: GOLD_500 }}
            >
              {word}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 28, color: ON_DARK }}>{tOg("subline")}</div>
      </div>
    </div>,
    { ...size, fonts: loadFonts() },
  );
}

// Each word keeps its trailing space ("See ", "what’s ", …).
function words(text: string) {
  return text.match(/\S+\s*/g) ?? [];
}

function localeOf(value: string) {
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}

type Fonts = NonNullable<NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"]>;

// Static instances (Satori can't use variable fonts or woff2), from Google Fonts. OFL.
// Read synchronously: under cacheComponents, async file IO would stop the prerender.
function loadFonts(): Fonts {
  const font = (file: string) => readFileSync(join(process.cwd(), "assets/fonts", file));
  return [
    { name: "Newsreader", data: font("Newsreader72-Medium.ttf"), weight: 500, style: "normal" },
    { name: "Newsreader", data: font("Newsreader72-Italic.ttf"), weight: 400, style: "italic" },
    { name: "Figtree", data: font("Figtree-Regular.ttf"), weight: 400, style: "normal" },
    { name: "Figtree", data: font("Figtree-SemiBold.ttf"), weight: 600, style: "normal" },
    { name: "Inter", data: font("Inter-SemiBold.ttf"), weight: 600, style: "normal" },
  ];
}
