import { tools } from "../data/tools";

/**
 * Busca una herramienta por slug en cualquiera de los dos idiomas (ES o EN).
 * Devuelve la ToolDefinition cruda. El consumidor la pasa por localizeTool().
 */
export function getToolBySlug(slug: string | undefined) {
  if (!slug) {
    return undefined;
  }

  return tools.find((tool) => tool.slug === slug || tool.slugEn === slug);
}
