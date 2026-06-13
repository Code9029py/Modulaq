import { describe, expect, it } from "vitest";
import { tools } from "../../tools/data/tools";
import { guides } from "./guides";
import { getGuideBySlug, getGuidesByLanguage } from "../utils/getGuides";

const toolIds = new Set(tools.map((tool) => tool.id));

describe("guides data", () => {
  it("has the expected number of guides per language", () => {
    expect(getGuidesByLanguage("es")).toHaveLength(4);
    expect(getGuidesByLanguage("en")).toHaveLength(2);
  });

  it("uses unique ids and slugs across all guides", () => {
    const ids = guides.map((guide) => guide.id);
    const slugs = guides.map((guide) => guide.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("points primaryToolId and relatedToolIds at real tools", () => {
    for (const guide of guides) {
      expect(toolIds.has(guide.primaryToolId)).toBe(true);
      for (const relatedId of guide.relatedToolIds) {
        expect(toolIds.has(relatedId)).toBe(true);
      }
    }
  });

  it("has non-empty SEO metadata and at least one section per guide", () => {
    for (const guide of guides) {
      expect(guide.seoTitle.length).toBeGreaterThan(0);
      expect(guide.seoDescription.length).toBeGreaterThan(0);
      expect(guide.h1.length).toBeGreaterThan(0);
      expect(guide.sections.length).toBeGreaterThan(0);
      expect(guide.conclusion.length).toBeGreaterThan(0);
    }
  });

  it("does not collide with any tool route (guides live under their own namespace)", () => {
    // Un slug de guía puede coincidir con el de una herramienta porque viven en
    // namespaces distintos (/guias vs /herramientas). Lo que no debe ocurrir es
    // que el PATH completo colisione.
    const toolPaths = new Set([
      ...tools.map((tool) => `/herramientas/${tool.slug}`),
      ...tools.map((tool) => `/en/tools/${tool.slugEn ?? tool.slug}`),
    ]);
    for (const guide of guides) {
      const guidePath =
        guide.language === "es" ? `/guias/${guide.slug}` : `/en/guides/${guide.slug}`;
      expect(toolPaths.has(guidePath)).toBe(false);
    }
  });

  it("resolves a guide by slug and exposes its language", () => {
    const guide = getGuideBySlug("image-base64");
    expect(guide?.language).toBe("en");
    expect(getGuideBySlug("does-not-exist")).toBeUndefined();
    expect(getGuideBySlug(undefined)).toBeUndefined();
  });
});
