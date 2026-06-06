import type { ToolMetadata } from "../../features/tools/types/tool.types";
import type { Language } from "./types";

/**
 * Mapas de paths por idioma para las rutas estáticas del shell público.
 * Fuente única de verdad — replicada también en I18nProvider.mapPathToLanguage()
 * pero acá expuesta como API utilitaria para componentes / sitemap / etc.
 */
const PATHS = {
  es: {
    home: "/",
    tools: "/herramientas",
    consultations: "/consultas",
    contact: "/contacto",
    requestTool: "/solicitar-herramienta",
    privacy: "/privacidad",
  },
  en: {
    home: "/en",
    tools: "/en/tools",
    consultations: "/en/contact",
    contact: "/en/contact",
    requestTool: "/en/request-tool",
    privacy: "/en/privacy",
  },
} as const;

export type StaticRouteKey = keyof (typeof PATHS)[Language];

export function localizedPath(key: StaticRouteKey, language: Language): string {
  return PATHS[language][key];
}

export function buildToolPathFor(tool: Pick<ToolMetadata, "slug" | "slugEn">, language: Language): string {
  if (language === "en") {
    return `/en/tools/${tool.slugEn ?? tool.slug}`;
  }
  return `/herramientas/${tool.slug}`;
}

/**
 * Versión genérica que recibe el slug crudo. Usar buildToolPathFor cuando se
 * tenga la ToolMetadata para resolver bien el slug EN.
 */
export function buildToolPath(slug: string, language: Language = "es"): string {
  if (language === "en") return `/en/tools/${slug}`;
  return `/herramientas/${slug}`;
}

export const STATIC_ROUTE_KEYS: StaticRouteKey[] = [
  "home",
  "tools",
  "consultations",
  "contact",
  "requestTool",
  "privacy",
];
