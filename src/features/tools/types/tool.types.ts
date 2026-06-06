export type ToolCategoryId =
  | "documents"
  | "pdf"
  | "text"
  | "data"
  | "image"
  | "development"
  | "ai"
  | "productivity";

export type ToolModeId = "online" | "integrable-code" | "api" | "documentation";

export type ToolStatus = "active" | "planned" | "draft";

export type ToolPricing = "free" | "freemium" | "premium";

export type ToolApiStatus = "not-planned" | "planned" | "beta" | "available";

export type ToolCategory = {
  id: ToolCategoryId;
  label: string;
  description: string;
};

export type ToolMode = {
  id: ToolModeId;
  label: string;
  plannedLabel: string;
  description: string;
};

/** Genérico para campos disponibles por idioma. ES es la fuente de verdad. */
export type Localizable<T> = { es: T; en: T };
export type LocalizableString = Localizable<string>;

export type ToolSeo = {
  title?: string;
  description?: string;
};

export type ToolDoc = {
  summary: string;
  howTo: string[];
  useCases: string[];
  limits?: string[];
  privacy?: string;
  commonErrors?: string[];
  technicalNotes?: string[];
};

export type CodeLanguage = "typescript" | "javascript" | "bash" | "html";

/** Snippet de código: el `code` y `dependencies` no se localizan; sólo prosa. */
export type CodeSnippet = {
  id: string;
  title: LocalizableString;
  description?: LocalizableString;
  language: CodeLanguage;
  code: string;
  dependencies?: string[];
  usageNotes?: Localizable<string[]>;
  limitations?: Localizable<string[]>;
};

export type ToolIntegrableCode = {
  summary?: LocalizableString;
  snippets: CodeSnippet[];
};

/**
 * Definición cruda de una herramienta — la fuente persistida en tools.ts.
 * Los campos públicos visibles llevan ambos idiomas. Para uso desde
 * componentes preferí `LocalizedTool` (versión resuelta y plana) vía
 * `useTool()` o `localizeTool()`.
 */
export type ToolDefinition = {
  id: string;
  slug: string;
  slugEn: string;
  /**
   * Si true, la versión EN del renderer todavía contiene strings en español.
   * El detalle EN se renderiza con noindex y la ruta se omite del sitemap
   * (regla #10 de Fase 2 i18n) hasta completar la migración.
   */
  i18nIncomplete?: boolean;
  name: LocalizableString;
  description: LocalizableString;
  category: ToolCategoryId;
  tags: Localizable<string[]>;
  modes: readonly ToolModeId[];
  plannedModes: readonly ToolModeId[];
  status: ToolStatus;
  pricing: ToolPricing;
  requiresBackend: boolean;
  requiresAI: boolean;
  apiStatus: ToolApiStatus;
  seo?: Localizable<ToolSeo>;
  doc?: Localizable<ToolDoc>;
  integrableCode?: ToolIntegrableCode;
};

/** Versión "plana" de un snippet, ya resuelta al idioma activo. */
export type LocalizedCodeSnippet = {
  id: string;
  title: string;
  description?: string;
  language: CodeLanguage;
  code: string;
  dependencies?: string[];
  usageNotes?: string[];
  limitations?: string[];
};

export type LocalizedToolIntegrableCode = {
  summary?: string;
  snippets: LocalizedCodeSnippet[];
};

/**
 * Herramienta resuelta al idioma activo, plana, lista para renderizar.
 * Alias del tipo histórico `ToolMetadata` para minimizar churn en call-sites.
 */
export type LocalizedTool = {
  id: string;
  slug: string;
  slugEn: string;
  i18nIncomplete?: boolean;
  name: string;
  description: string;
  category: ToolCategoryId;
  tags: string[];
  modes: readonly ToolModeId[];
  plannedModes: readonly ToolModeId[];
  status: ToolStatus;
  pricing: ToolPricing;
  requiresBackend: boolean;
  requiresAI: boolean;
  apiStatus: ToolApiStatus;
  seo?: ToolSeo;
  doc?: ToolDoc;
  integrableCode?: LocalizedToolIntegrableCode;
};

/**
 * Alias de back-compat. Los componentes que recibían `ToolMetadata` (plano)
 * siguen funcionando — pero ahora reciben LocalizedTool ya resuelto.
 */
export type ToolMetadata = LocalizedTool;

export type ToolFilters = {
  search: string;
  category: ToolCategoryId | "all";
  mode: ToolModeId | "all";
  status: ToolStatus | "all";
};
