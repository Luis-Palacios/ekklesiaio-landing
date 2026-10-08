import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS fills transparent corners with black and applies its own mask, so the
// rounded icon is drawn on a square of brand navy (navy-900 in brand/theme.css).
const NAVY_900 = "#0B2341";

export default async function AppleIcon() {
  const svg = await readFile(join(process.cwd(), "public/brand/icon.svg"), "utf8");
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: NAVY_900 }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not the browser */}
      <img src={src} width={size.width} height={size.height} alt="" />
    </div>,
    size,
  );
}
