import { Figtree, Inter, Newsreader } from "next/font/google";

// Font stacks are mapped to Tailwind utilities in brand/theme.css
// (font-display, font-sans, font-logo). See docs/DESIGN.md §3.2.

export const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
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
