// Generates dist/sitemap.xml by scanning the prerendered HTML output.
// Decoupled from the SSG build so it works identically on every platform.
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, sep } from "node:path";

const SITE_URL = "https://modulaq.dev";
const distDir = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");

// Compatibility routes that canonicalize to /consultas, plus the noindex 404.
const excludedRoutes = new Set(["/contacto", "/solicitar-herramienta", "/404"]);

function collectHtmlRoutes(dir) {
  const routes = [];

  const walk = (current) => {
    for (const entry of readdirSync(current)) {
      const fullPath = join(current, entry);

      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!entry.endsWith(".html")) {
        continue;
      }

      const relativePath = relative(dir, fullPath).split(sep).join("/");
      const trimmed = relativePath.replace(/index\.html$/, "").replace(/\.html$/, "");
      const route = `/${trimmed}`.replace(/\/$/, "") || "/";
      routes.push(route);
    }
  };

  walk(dir);
  return routes;
}

const routes = Array.from(new Set(collectHtmlRoutes(distDir)))
  .filter((route) => !excludedRoutes.has(route))
  .sort();

const urls = routes
  .map((route) => `  <url><loc>${SITE_URL}${route === "/" ? "/" : route}</loc></url>`)
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
writeFileSync(join(distDir, "sitemap.xml"), sitemap, "utf-8");

console.log(`[sitemap] ${routes.length} URLs written to dist/sitemap.xml`);
