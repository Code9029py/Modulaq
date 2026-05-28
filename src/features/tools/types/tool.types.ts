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

export type CodeSnippet = {
  id: string;
  title: string;
  description?: string;
  language: CodeLanguage;
  code: string;
  dependencies?: string[];
  usageNotes?: string[];
  limitations?: string[];
};

export type ToolIntegrableCode = {
  summary?: string;
  snippets: CodeSnippet[];
};

export type ToolMetadata = {
  id: string;
  name: string;
  slug: string;
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
  integrableCode?: ToolIntegrableCode;
};

export type ToolFilters = {
  search: string;
  category: ToolCategoryId | "all";
  mode: ToolModeId | "all";
  status: ToolStatus | "all";
};
