import { describe, expect, it } from "vitest";
import type { ToolDefinition } from "../types/tool.types";
import { filterTools, orderToolsByFavoriteIds } from "./filterTools";

function createTool(id: string, overrides: Partial<ToolDefinition> = {}): ToolDefinition {
  return {
    id,
    name: { es: id, en: id },
    slug: id,
    slugEn: id,
    description: { es: `${id} descripcion`, en: `${id} description` },
    category: "pdf",
    tags: { es: [], en: [] },
    modes: ["online"],
    plannedModes: [],
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "not-planned",
    ...overrides,
  };
}

describe("filterTools", () => {
  it("matches search in Spanish and English metadata", () => {
    const tools = [
      createTool("pdf", { name: { es: "Unir PDFs", en: "Merge PDFs" } }),
      createTool("qr", { tags: { es: ["codigo"], en: ["code"] } }),
    ];

    expect(filterTools(tools, { search: "merge", category: "all", mode: "all", status: "all" })).toEqual([tools[0]]);
    expect(filterTools(tools, { search: "codigo", category: "all", mode: "all", status: "all" })).toEqual([tools[1]]);
  });
});

describe("orderToolsByFavoriteIds", () => {
  it("puts favorite tools first using the saved favorite order", () => {
    const tools = [createTool("merge"), createTool("split"), createTool("qr"), createTool("text")];

    const orderedTools = orderToolsByFavoriteIds(tools, ["text", "split"]);

    expect(orderedTools.map((tool) => tool.id)).toEqual(["text", "split", "merge", "qr"]);
  });

  it("keeps the original order for non-favorite tools", () => {
    const tools = [createTool("merge"), createTool("split"), createTool("qr")];

    const orderedTools = orderToolsByFavoriteIds(tools, ["unknown"]);

    expect(orderedTools.map((tool) => tool.id)).toEqual(["merge", "split", "qr"]);
  });

  it("applies the favorite order to already-filtered tool lists", () => {
    const filteredTools = [createTool("pdf-counter"), createTool("split"), createTool("merge")];

    const orderedTools = orderToolsByFavoriteIds(filteredTools, ["qr", "merge", "split"]);

    expect(orderedTools.map((tool) => tool.id)).toEqual(["merge", "split", "pdf-counter"]);
  });
});
