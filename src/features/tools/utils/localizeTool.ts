import { useMemo } from "react";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import type { Language } from "../../../shared/i18n/types";
import type {
  CodeSnippet,
  LocalizableString,
  Localizable,
  LocalizedCodeSnippet,
  LocalizedTool,
  LocalizedToolIntegrableCode,
  ToolDefinition,
  ToolIntegrableCode,
} from "../types/tool.types";

function pick<T>(value: Localizable<T>, language: Language): T {
  return value[language] ?? value.es;
}

function pickString(value: LocalizableString, language: Language): string {
  return pick(value, language);
}

function localizeSnippet(snippet: CodeSnippet, language: Language): LocalizedCodeSnippet {
  return {
    id: snippet.id,
    title: pickString(snippet.title, language),
    description: snippet.description ? pickString(snippet.description, language) : undefined,
    language: snippet.language,
    code: snippet.code,
    dependencies: snippet.dependencies,
    usageNotes: snippet.usageNotes ? pick(snippet.usageNotes, language) : undefined,
    limitations: snippet.limitations ? pick(snippet.limitations, language) : undefined,
  };
}

function localizeIntegrableCode(
  data: ToolIntegrableCode,
  language: Language,
): LocalizedToolIntegrableCode {
  return {
    summary: data.summary ? pickString(data.summary, language) : undefined,
    snippets: data.snippets.map((snippet) => localizeSnippet(snippet, language)),
  };
}

/**
 * Resuelve una `ToolDefinition` a su versión plana en el idioma indicado.
 * Caída segura: si la traducción EN falta, usa ES.
 */
export function localizeTool(definition: ToolDefinition, language: Language): LocalizedTool {
  return {
    id: definition.id,
    slug: definition.slug,
    slugEn: definition.slugEn,
    i18nIncomplete: definition.i18nIncomplete,
    name: pickString(definition.name, language),
    description: pickString(definition.description, language),
    category: definition.category,
    tags: pick(definition.tags, language),
    modes: definition.modes,
    plannedModes: definition.plannedModes,
    status: definition.status,
    pricing: definition.pricing,
    requiresBackend: definition.requiresBackend,
    requiresAI: definition.requiresAI,
    apiStatus: definition.apiStatus,
    seo: definition.seo ? pick(definition.seo, language) : undefined,
    doc: definition.doc ? pick(definition.doc, language) : undefined,
    integrableCode: definition.integrableCode
      ? localizeIntegrableCode(definition.integrableCode, language)
      : undefined,
  };
}

/**
 * Hook React: dada la definición cruda, devuelve la versión resuelta al
 * idioma activo del provider i18n. Memoizado por (definition, language).
 */
export function useTool(definition: ToolDefinition): LocalizedTool;
export function useTool(definition: ToolDefinition | undefined): LocalizedTool | undefined;
export function useTool(definition: ToolDefinition | undefined): LocalizedTool | undefined {
  const { language } = useI18n();
  return useMemo(
    () => (definition ? localizeTool(definition, language) : undefined),
    [definition, language],
  );
}
