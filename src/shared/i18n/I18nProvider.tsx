import { createContext, type ReactNode, useCallback, useContext, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { tools } from "../../features/tools/data/tools";
import { en } from "./dictionaries/en";
import { es, type TranslationKey } from "./dictionaries/es";
import { DEFAULT_LANGUAGE, isLanguage, type Language } from "./types";

type Variables = Record<string, string | number>;

type I18nContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Variables) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const DICTIONARIES: Record<Language, Record<string, string>> = {
  es,
  en,
};

const INTERPOLATION = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;

function interpolate(template: string, vars?: Variables): string {
  if (!vars) {
    return template;
  }

  return template.replace(INTERPOLATION, (_, key: string) => {
    const value = vars[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

/**
 * Detecta el idioma activo a partir del pathname.
 * - "/en" o "/en/..." → "en"
 * - cualquier otro → "es" (default)
 */
export function detectLanguageFromPath(pathname: string): Language {
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return "en";
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Mapa de rutas estáticas para resolver el equivalente en el otro idioma.
 * Clave = path en ES; valor = path en EN.
 */
const STATIC_ROUTE_MAP: Array<[string, string]> = [
  ["/", "/en"],
  ["/herramientas", "/en/tools"],
  ["/consultas", "/en/contact"],
  ["/contacto", "/en/contact"],
  ["/solicitar-herramienta", "/en/request-tool"],
  ["/privacidad", "/en/privacy"],
];

const ES_TO_EN = new Map(STATIC_ROUTE_MAP);
const EN_TO_ES = new Map(STATIC_ROUTE_MAP.map(([es, en]) => [en, es] as const));

/**
 * Dado un pathname en un idioma, devuelve el pathname equivalente en el otro.
 * Cubre estáticas + detalle de herramientas (resuelve slug por id).
 */
export function mapPathToLanguage(pathname: string, targetLang: Language): string {
  const cleaned = pathname.replace(/\/+$/, "") || "/";

  // Detalle de herramienta
  const esToolMatch = cleaned.match(/^\/herramientas\/([^/]+)$/);
  if (esToolMatch) {
    if (targetLang === "es") return cleaned;
    const tool = tools.find((t) => t.slug === esToolMatch[1]);
    return tool ? `/en/tools/${tool.slugEn ?? tool.slug}` : "/en/tools";
  }

  const enToolMatch = cleaned.match(/^\/en\/tools\/([^/]+)$/);
  if (enToolMatch) {
    if (targetLang === "en") return cleaned;
    const tool = tools.find((t) => (t.slugEn ?? t.slug) === enToolMatch[1]);
    return tool ? `/herramientas/${tool.slug}` : "/herramientas";
  }

  // Estáticas
  if (targetLang === "en") {
    if (EN_TO_ES.has(cleaned)) return cleaned;
    return ES_TO_EN.get(cleaned) ?? "/en";
  }
  if (ES_TO_EN.has(cleaned)) return cleaned;
  return EN_TO_ES.get(cleaned) ?? "/";
}

type I18nProviderProps = {
  children: ReactNode;
};

export function I18nProvider({ children }: I18nProviderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const language = detectLanguageFromPath(location.pathname);

  const t = useCallback(
    (key: TranslationKey, vars?: Variables) => {
      const dict = DICTIONARIES[language];
      const raw = dict[key] ?? DICTIONARIES[DEFAULT_LANGUAGE][key] ?? key;
      return interpolate(raw, vars);
    },
    [language],
  );

  const setLanguage = useCallback(
    (next: Language) => {
      if (next === language) return;
      const target = mapPathToLanguage(location.pathname, next);
      navigate(target);
    },
    [language, location.pathname, navigate],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n debe usarse dentro de <I18nProvider />");
  }
  return ctx;
}

export { isLanguage };
export type { Language };
