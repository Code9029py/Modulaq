import type { ToolCategoryId, ToolFilters, ToolMetadata, ToolModeId, ToolStatus } from "../types/tool.types";

export function filterTools(tools: ToolMetadata[], filters: ToolFilters) {
  const normalizedSearch = filters.search.trim().toLowerCase();

  return tools.filter((tool) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [tool.name, tool.description, ...tool.tags].some((value) => value.toLowerCase().includes(normalizedSearch));
    const matchesCategory = filters.category === "all" || tool.category === filters.category;
    const matchesMode = filters.mode === "all" || tool.modes.includes(filters.mode);
    const matchesStatus = filters.status === "all" || tool.status === filters.status;

    return matchesSearch && matchesCategory && matchesMode && matchesStatus;
  });
}

export function getVisibleCategoryIds(tools: ToolMetadata[]): ToolCategoryId[] {
  const visibleStatuses = new Set(["active", "planned"]);
  const categoryIds = tools
    .filter((tool) => visibleStatuses.has(tool.status))
    .map((tool) => tool.category);

  return Array.from(new Set(categoryIds));
}

export function getAvailableModeIds(tools: ToolMetadata[]): ToolModeId[] {
  const modeIds = tools.flatMap((tool) => tool.modes);

  return Array.from(new Set(modeIds));
}

export function getVisibleStatuses(tools: ToolMetadata[]): ToolStatus[] {
  return Array.from(new Set(tools.map((tool) => tool.status)));
}
