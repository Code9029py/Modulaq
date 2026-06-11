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
});
