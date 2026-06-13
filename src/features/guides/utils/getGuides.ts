import type { Language } from "../../../shared/i18n/types";
import { guides } from "../data/guides";
import type { Guide } from "../types/guide.types";

/** Guías del idioma indicado, en el orden de declaración. */
export function getGuidesByLanguage(language: Language): Guide[] {
  return guides.filter((guide) => guide.language === language);
}

/**
 * Resuelve una guía por slug. Devuelve también si el idioma coincide con el
 * esperado para evitar servir una guía ES bajo /en/guides o viceversa.
 */
export function getGuideBySlug(slug: string | undefined): Guide | undefined {
  if (!slug) return undefined;
  return guides.find((guide) => guide.slug === slug);
}
