import type { SVGProps } from "react";

// Inline so the wordmark <text> uses the page's loaded Inter (docs/DESIGN.md §3.4).
// The main color is currentColor; the cross and "io" are always gold.

type Variant = "light" | "dark";

const variantColor: Record<Variant, string> = {
  light: "text-navy-900",
  dark: "text-white",
};

function MarkPaths() {
  return (
    <>
      <path
        d="M22 42V27c0-4 2-7 5-9l13-9 13 9c3 2 5 5 5 9v15"
        fill="none"
        stroke="currentColor"
        strokeWidth={5.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40 7v16M34 15h12"
        fill="none"
        className="stroke-gold-500"
        strokeWidth={5.5}
        strokeLinecap="round"
      />
      <circle cx="40" cy="30" r="4.2" fill="currentColor" />
      <circle cx="29" cy="32" r="3.2" fill="currentColor" />
      <circle cx="51" cy="32" r="3.2" fill="currentColor" />
      <path d="M32 48c0-7 3.3-11 8-11s8 4 8 11" fill="currentColor" />
      <path
        d="M23 47c0-5 2.3-8 6-8 2.2 0 3.8 1.1 4.8 3.1"
        fill="none"
        stroke="currentColor"
        strokeWidth={4.5}
        strokeLinecap="round"
      />
      <path
        d="M57 47c0-5-2.3-8-6-8-2.2 0-3.8 1.1-4.8 3.1"
        fill="none"
        stroke="currentColor"
        strokeWidth={4.5}
        strokeLinecap="round"
      />
    </>
  );
}

/** Mark + wordmark lockup. Decorative by default; label the surrounding link. */
export function Logo({
  variant = "light",
  className = "",
  ...props
}: { variant?: Variant } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="30 12 370 70"
      width="180"
      height="34"
      aria-hidden="true"
      focusable="false"
      className={`${variantColor[variant]} ${className}`}
      {...props}
    >
      <g transform="translate(10 10) scale(1.25)">
        <MarkPaths />
      </g>
      <text x="105" y="77" fontSize="54" letterSpacing="-2" className="font-logo font-[650]">
        <tspan fill="currentColor">ekklesia</tspan>
        <tspan className="fill-gold-500">io</tspan>
      </text>
    </svg>
  );
}

/** The mark alone (closing CTA). */
export function LogoMark({
  variant = "light",
  className = "",
  ...props
}: { variant?: Variant } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      className={`${variantColor[variant]} ${className}`}
      {...props}
    >
      <g transform="translate(10 10)">
        <MarkPaths />
      </g>
    </svg>
  );
}
