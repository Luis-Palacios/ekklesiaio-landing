import { fontVariables } from "./fonts";
import "./globals.css";

// Temporary root layout for the scaffold. Step 2 (i18n) moves <html> into
// app/[locale]/layout.tsx so `lang` follows the active locale.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
