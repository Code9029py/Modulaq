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

    expect(filterTools(tools, { search: "merge", categories: [], mode: "all", status: "all" })).toEqual([tools[0]]);
    expect(filterTools(tools, { search: "codigo", categories: [], mode: "all", status: "all" })).toEqual([tools[1]]);
  });

  it("empty categories means all (Todas)", () => {
    const tools = [
      createTool("pdf-a", { category: "pdf" }),
      createTool("image-a", { category: "image" }),
      createTool("text-a", { category: "text" }),
    ];

    expect(filterTools(tools, { search: "", categories: [], mode: "all", status: "all" })).toEqual(tools);
  });

  it("combines multiple categories with OR", () => {
    const tools = [
      createTool("pdf-a", { category: "pdf" }),
      createTool("image-a", { category: "image" }),
      createTool("text-a", { category: "text" }),
    ];

    const result = filterTools(tools, {
      search: "",
      categories: ["pdf", "image"],
      mode: "all",
      status: "all",
    });

    expect(result.map((tool) => tool.id)).toEqual(["pdf-a", "image-a"]);
  });

  it("combines category multiselect with search", () => {
    const tools = [
      createTool("merge", { category: "pdf", name: { es: "Unir PDFs", en: "Merge PDFs" } }),
      createTool("crop", { category: "image", name: { es: "Recortar imagen", en: "Crop image" } }),
      createTool("split", { category: "pdf", name: { es: "Dividir PDF", en: "Split PDF" } }),
    ];

    const result = filterTools(tools, {
      search: "split",
      categories: ["pdf", "image"],
      mode: "all",
      status: "all",
    });

    expect(result.map((tool) => tool.id)).toEqual(["split"]);
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
