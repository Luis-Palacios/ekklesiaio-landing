// Email clients can't read CSS variables or load the site's fonts, so the template
// needs literal values. These are copied from brand/theme.css: keep them in sync.
// This is the one place outside brand/ where raw hex is allowed.

export const emailColors = {
  navy900: "#0B2341",
  gold500: "#F2B544",
  ink: "#33445A",
  muted: "#56667A",
  line: "#E2E5EA",
  paper: "#FBFAF7",
  surface: "#FFFFFF",
} as const;

export const emailFonts = {
  display: 'Newsreader, Georgia, "Times New Roman", serif',
  sans: "Figtree, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  logo: "Inter, Arial, Helvetica, sans-serif",
} as const;
