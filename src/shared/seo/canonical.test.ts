import { describe, expect, it } from "vitest";
import { ensureNoTrailingSlash, SITE_URL, toCanonicalUrl } from "./canonical";

describe("ensureNoTrailingSlash", () => {
  it("preserva la raíz", () => {
    expect(ensureNoTrailingSlash("/")).toBe("/");
  });

  it("quita un trailing slash en rutas internas", () => {
    expect(ensureNoTrailingSlash("/herramientas/")).toBe("/herramientas");
    expect(ensureNoTrailingSlash("/en/tools/")).toBe("/en/tools");
    expect(ensureNoTrailingSlash("/herramientas/convertir-imagen/")).toBe(
      "/herramientas/convertir-imagen",
    );
  });

  it("colapsa múltiples slashes finales", () => {
    expect(ensureNoTrailingSlash("/herramientas//")).toBe("/herramientas");
  });

  it("no altera rutas ya canónicas", () => {
    expect(ensureNoTrailingSlash("/herramientas")).toBe("/herramientas");
    expect(ensureNoTrailingSlash("/en")).toBe("/en");
  });

  it("preserva query y hash si existen", () => {
    expect(ensureNoTrailingSlash("/herramientas/?x=1")).toBe("/herramientas?x=1");
    expect(ensureNoTrailingSlash("/herramientas/#top")).toBe("/herramientas#top");
  });
});

describe("toCanonicalUrl", () => {
  it("devuelve la raíz con slash final", () => {
    expect(toCanonicalUrl("/")).toBe(`${SITE_URL}/`);
  });

  it("compone URLs absolutas sin trailing slash", () => {
    expect(toCanonicalUrl("/herramientas")).toBe(`${SITE_URL}/herramientas`);
    expect(toCanonicalUrl("/en/tools/convert-image")).toBe(
      `${SITE_URL}/en/tools/convert-image`,
    );
  });

  it("normaliza paths que llegan con trailing slash", () => {
    expect(toCanonicalUrl("/herramientas/")).toBe(`${SITE_URL}/herramientas`);
    expect(toCanonicalUrl("/en/tools/")).toBe(`${SITE_URL}/en/tools`);
  });
});
