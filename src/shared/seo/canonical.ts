// Política de URL canónica para Modulaq.
//
// El hosting (Cloudflare Pages) sirve los archivos `dist/<route>.html` con 200
// y redirige (308) las variantes con trailing slash a la versión sin slash.
// Por eso la URL canónica del sitio es SIN trailing slash, salvo la raíz "/".
//
// Estas helpers normalizan paths/URLs para que canonical, hreflang, og:url y el
// sitemap nunca emitan una variante que el hosting redirigiría.
import { siteConfig } from "../constants/site";

export const SITE_URL = `https://${siteConfig.domain}`;

/**
 * Quita trailing slashes de un path interno preservando la raíz "/".
 * No toca query/hash (no se usan en canonical, pero el helper es defensivo).
 */
export function ensureNoTrailingSlash(path: string): string {
  if (path === "/") return "/";
  const [pathname, ...rest] = path.split(/(?=[?#])/);
  const stripped = pathname.replace(/\/+$/, "") || "/";
  return stripped + rest.join("");
}

/** Convierte un path interno en URL absoluta canónica. */
export function toCanonicalUrl(path: string): string {
  const normalized = ensureNoTrailingSlash(path);
  if (normalized === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${normalized}`;
}
