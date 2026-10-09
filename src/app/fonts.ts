import { Figtree, Inter } from "next/font/google";
import localFont from "next/font/local";

// Font stacks are mapped to Tailwind utilities in brand/theme.css
// (font-display, font-sans, font-logo). See docs/DESIGN.md §3.2.

// Newsreader is self-hosted: the three faces the site uses, each with a fixed weight and
// the optical-size axis (opsz 6–72) kept. Google's full variable files (every weight) are
// ~280 KB for normal + italic; these are ~180 KB. Latin subset, from Google Fonts (OFL).
// Re-download: fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@<ital>,6..72,<wght>
export const newsreader = localFont({
  src: [
    { path: "../../assets/fonts/Newsreader-Regular.latin.woff2", weight: "400", style: "normal" },
    { path: "../../assets/fonts/Newsreader-Medium.latin.woff2", weight: "500", style: "normal" },
    { path: "../../assets/fonts/Newsreader-Italic.latin.woff2", weight: "400", style: "italic" },
  ],
  display: "swap",
  adjustFontFallback: "Times New Roman",
  variable: "--font-newsreader",
});

export const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-figtree",
});

// Wordmark only (logo SVG <text>).
export const inter = Inter({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const fontVariables = [newsreader.variable, figtree.variable, inter.variable].join(" ");
