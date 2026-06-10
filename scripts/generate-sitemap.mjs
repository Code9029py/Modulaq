// Generates dist/sitemap.xml by scanning the prerendered HTML output.
// Includes hreflang alternates linking each Spanish route to its English
// counterpart (and vice versa) when both exist.
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, sep } from "node:path";

const SITE_URL = "https://modulaq.dev";
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(repoRoot, "dist");

// Política canonical: sin trailing slash salvo la raíz "/". Refleja
// src/shared/seo/canonical.ts (duplicado porque este script corre en Node sin
// poder importar TS del bundle).
function ensureNoTrailingSlash(path) {
  if (path === "/") return "/";
  return path.replace(/\/+$/, "") || "/";
}

function toCanonicalUrl(path) {
  const normalized = ensureNoTrailingSlash(path);
  if (normalized === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${normalized}`;
}

// Routes that canonicalize elsewhere or are noindex.
const excludedRoutes = new Set([
  "/contacto",
  "/solicitar-herramienta",
  "/en/request-tool",
  "/404",
]);

// Map ES → EN equivalents for the static shell routes. Tool detail pages are
// mapped programmatically via the tools list. Keys are paths without trailing
// slash; "/" maps to "/en".
const STATIC_ROUTE_MAP = new Map([
  ["/", "/en"],
  ["/herramientas", "/en/tools"],
  ["/consultas", "/en/contact"],
  ["/privacidad", "/en/privacy"],
]);

const REVERSE_ROUTE_MAP = new Map(Array.from(STATIC_ROUTE_MAP, ([es, en]) => [en, es]));

function collectToolRouteMaps() {
  const source = readFileSync(join(repoRoot, "src", "features", "tools", "data", "tools.ts"), "utf-8");
  const esToEn = new Map();

  for (const match of source.matchAll(/slug:\s*"([^"]+)"[\s\S]*?slugEn:\s*"([^"]+)"/g)) {
    esToEn.set(match[1], match[2]);
  }

  return {
    esToEn,
    enToEs: new Map(Array.from(esToEn, ([es, en]) => [en, es])),
  };
}

const TOOL_ROUTE_MAPS = collectToolRouteMaps();

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

function findAlternate(route, allRoutes) {
  if (STATIC_ROUTE_MAP.has(route)) {
    const en = STATIC_ROUTE_MAP.get(route);
    return allRoutes.has(en) ? en : null;
  }
  if (REVERSE_ROUTE_MAP.has(route)) {
    const es = REVERSE_ROUTE_MAP.get(route);
    return allRoutes.has(es) ? es : null;
  }

  const esTool = route.match(/^\/herramientas\/([^/]+)$/);
  if (esTool) {
    const enSlug = TOOL_ROUTE_MAPS.esToEn.get(esTool[1]);
    const candidate = `/en/tools/${enSlug ?? esTool[1]}`;
    if (allRoutes.has(candidate)) return candidate;
    return null;
  }
  const enTool = route.match(/^\/en\/tools\/([^/]+)$/);
  if (enTool) {
    const esSlug = TOOL_ROUTE_MAPS.enToEs.get(enTool[1]);
    const candidate = `/herramientas/${esSlug ?? enTool[1]}`;
    if (allRoutes.has(candidate)) return candidate;
    return null;
  }
  return null;
}

function isEnglishRoute(route) {
  return route === "/en" || route.startsWith("/en/");
}

const allRoutes = Array.from(new Set(collectHtmlRoutes(distDir)))
  .filter((route) => !excludedRoutes.has(route))
  .sort();

const routeSet = new Set(allRoutes);

const urlsXml = allRoutes
  .map((route) => {
    const loc = toCanonicalUrl(route);
    const lang = isEnglishRoute(route) ? "en" : "es";
    const alt = findAlternate(route, routeSet);
    const altLang = lang === "es" ? "en" : "es";

    const lines = [
      "  <url>",
      `    <loc>${loc}</loc>`,
      `    <xhtml:link rel="alternate" hreflang="${lang}" href="${loc}" />`,
    ];
    if (alt) {
      const altLoc = toCanonicalUrl(alt);
      lines.push(`    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altLoc}" />`);
      // x-default points to Spanish (the configured default).
      const xDefault = lang === "es" ? loc : altLoc;
      lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefault}" />`);
    } else {
      lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />`);
    }
    lines.push("  </url>");
    return lines.join("\n");
  })
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urlsXml}\n</urlset>\n`;
writeFileSync(join(distDir, "sitemap.xml"), sitemap, "utf-8");

console.log(`[sitemap] ${allRoutes.length} URLs written to dist/sitemap.xml`);
