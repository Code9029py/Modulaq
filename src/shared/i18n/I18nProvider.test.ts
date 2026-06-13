import { describe, expect, it } from "vitest";
import { mapPathToLanguage } from "./I18nProvider";

describe("mapPathToLanguage", () => {
  it("keeps Spanish static routes when targeting Spanish", () => {
    expect(mapPathToLanguage("/", "es")).toBe("/");
    expect(mapPathToLanguage("/herramientas", "es")).toBe("/herramientas");
    expect(mapPathToLanguage("/privacidad", "es")).toBe("/privacidad");
  });

  it("keeps English static routes when targeting English", () => {
    expect(mapPathToLanguage("/en", "en")).toBe("/en");
    expect(mapPathToLanguage("/en/tools", "en")).toBe("/en/tools");
    expect(mapPathToLanguage("/en/privacy", "en")).toBe("/en/privacy");
  });

  it("maps static routes between Spanish and English", () => {
    expect(mapPathToLanguage("/herramientas", "en")).toBe("/en/tools");
    expect(mapPathToLanguage("/en/tools", "es")).toBe("/herramientas");
  });

  it("maps the guides index between languages", () => {
    expect(mapPathToLanguage("/guias", "en")).toBe("/en/guides");
    expect(mapPathToLanguage("/en/guides", "es")).toBe("/guias");
  });

  it("falls back single-language guide details to the other language's index", () => {
    expect(mapPathToLanguage("/guias/unir-pdf-sin-subir-archivos", "en")).toBe("/en/guides");
    expect(mapPathToLanguage("/en/guides/image-base64", "es")).toBe("/guias");
  });

  it("keeps a guide detail path when targeting its own language", () => {
    expect(mapPathToLanguage("/guias/unir-pdf-sin-subir-archivos", "es")).toBe(
      "/guias/unir-pdf-sin-subir-archivos",
    );
    expect(mapPathToLanguage("/en/guides/image-base64", "en")).toBe("/en/guides/image-base64");
  });
});
