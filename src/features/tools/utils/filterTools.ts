import type { ToolCategoryId, ToolDefinition, ToolFilters, ToolModeId, ToolStatus } from "../types/tool.types";

/**
 * Filtra `ToolDefinition`s. La busqueda matchea en ambos idiomas para que el
 * usuario pueda escribir en EN o ES sin importar la UI activa.
 */
export function filterTools(tools: ToolDefinition[], filters: ToolFilters) {
  const normalizedSearch = filters.search.trim().toLowerCase();

  return tools.filter((tool) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [
        tool.name.es,
        tool.name.en,
        tool.description.es,
        tool.description.en,
        ...tool.tags.es,
        ...tool.tags.en,
      ].some((value) => value.toLowerCase().includes(normalizedSearch));
    const matchesCategory = filters.category === "all" || tool.category === filters.category;
    const matchesMode = filters.mode === "all" || tool.modes.includes(filters.mode);
    const matchesStatus = filters.status === "all" || tool.status === filters.status;

    return matchesSearch && matchesCategory && matchesMode && matchesStatus;
  });
}

export function orderToolsByFavoriteIds(tools: ToolDefinition[], favoriteIds: string[]) {
  if (favoriteIds.length === 0) {
    return tools;
  }

  const favoriteOrder = new Map<string, number>();
  favoriteIds.forEach((id, index) => {
    if (!favoriteOrder.has(id)) {
      favoriteOrder.set(id, index);
    }
  });

  return tools
    .map((tool, index) => ({ favoriteIndex: favoriteOrder.get(tool.id), index, tool }))
    .sort((a, b) => {
      if (a.favoriteIndex !== undefined && b.favoriteIndex !== undefined) {
        return a.favoriteIndex - b.favoriteIndex;
      }
      if (a.favoriteIndex !== undefined) {
        return -1;
      }
      if (b.favoriteIndex !== undefined) {
        return 1;
      }
      return a.index - b.index;
    })
    .map((entry) => entry.tool);
}

export function getVisibleCategoryIds(tools: ToolDefinition[]): ToolCategoryId[] {
  const visibleStatuses = new Set(["active", "planned"]);
  const categoryIds = tools
    .filter((tool) => visibleStatuses.has(tool.status))
    .map((tool) => tool.category);

  return Array.from(new Set(categoryIds));
}

export function getAvailableModeIds(tools: ToolDefinition[]): ToolModeId[] {
  const modeIds = tools.flatMap((tool) => tool.modes);

  return Array.from(new Set(modeIds));
}

export function getVisibleStatuses(tools: ToolDefinition[]): ToolStatus[] {
  return Array.from(new Set(tools.map((tool) => tool.status)));
}
