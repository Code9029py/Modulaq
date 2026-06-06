import { buildToolPath as buildToolPathLocalized, localizedPath } from "../../shared/i18n/paths";
import type { Language } from "../../shared/i18n/types";

/**
 * Mapa de paths ES (back-compat con componentes que aún no fueron migrados a
 * useI18n). Para uso locale-aware preferí `localizedPath(key, language)`.
 */
export const routePaths = {
  home: "/",
  tools: "/herramientas",
  toolDetail: "/herramientas/:slug",
  consultations: "/consultas",
  requestTool: "/solicitar-herramienta",
  contact: "/contacto",
  privacy: "/privacidad",
};

export function buildToolPath(slug: string, language: Language = "es") {
  return buildToolPathLocalized(slug, language);
}

export { localizedPath };
