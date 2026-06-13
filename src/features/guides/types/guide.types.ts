import type { Language } from "../../../shared/i18n/types";

/**
 * Bloques de contenido de una guía. Cada sección se compone de bloques
 * tipados para mantener un renderizado consistente sin acoplar el contenido
 * editorial a un componente por guía.
 */
export type GuideBlock =
  | { kind: "p"; text: string }
  | { kind: "steps"; items: string[] }
  | { kind: "list"; items: string[] };

export type GuideSection = {
  heading: string;
  blocks: GuideBlock[];
};

export type Guide = {
  /** Identificador estable, único entre todas las guías. */
  id: string;
  /** Idioma de la guía. Las guías son single-language por diseño. */
  language: Language;
  /** Segmento de ruta (sin el prefijo /guias o /en/guides). */
  slug: string;
  /** Title para SEO (se le añade " · Modulaq"). */
  seoTitle: string;
  /** Meta description. */
  seoDescription: string;
  /** Encabezado H1 visible. */
  h1: string;
  /** Entradilla bajo el H1; también se usa como extracto en el índice. */
  lead: string;
  /** Herramienta principal a la que la guía dirige (id de tools.ts). */
  primaryToolId: string;
  /** Cuerpo editorial. */
  sections: GuideSection[];
  /** Herramientas relacionadas (ids de tools.ts) para enlazado interno. */
  relatedToolIds: string[];
  /** Cierre corto. */
  conclusion: string;
};
