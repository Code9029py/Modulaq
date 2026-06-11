import { describe, expect, it } from "vitest";
import { FONT_SIZE_MAX, FONT_SIZE_MIN, validateFontSize } from "./textToPdf.service";

describe("validateFontSize", () => {
  it("acepta el default 11", () => {
    expect(validateFontSize(11)).toBeNull();
  });

  it("acepta el mínimo y el máximo", () => {
    expect(validateFontSize(FONT_SIZE_MIN)).toBeNull();
    expect(validateFontSize(FONT_SIZE_MAX)).toBeNull();
  });

  it(`rechaza < ${FONT_SIZE_MIN}`, () => {
    expect(validateFontSize(FONT_SIZE_MIN - 1)).toBe("tools.errors.textToPdfFontSizeOutOfRange");
  });

  it(`rechaza > ${FONT_SIZE_MAX}`, () => {
    expect(validateFontSize(FONT_SIZE_MAX + 1)).toBe("tools.errors.textToPdfFontSizeOutOfRange");
  });

  it("rechaza NaN", () => {
    expect(validateFontSize(NaN)).toBe("tools.errors.textToPdfFontSizeInvalid");
  });

  it("rechaza decimales", () => {
    expect(validateFontSize(11.5)).toBe("tools.errors.textToPdfFontSizeInvalid");
  });
});
