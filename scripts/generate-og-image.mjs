// Rasterizes public/og-image.svg into a 1200x630 PNG for social previews
// (Open Graph / Twitter don't render SVG). Run manually when branding changes:
//   node scripts/generate-og-image.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const svg = readFileSync(join(publicDir, "og-image.svg"));

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
  font: { loadSystemFonts: true },
  background: "#0f1729",
});

const png = resvg.render().asPng();
writeFileSync(join(publicDir, "og-image.png"), png);

console.log(`[og-image] wrote public/og-image.png (${(png.length / 1024).toFixed(1)} KiB)`);
