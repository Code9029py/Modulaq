import { describe, expect, it } from "vitest";
import {
  buildPlaceholderFileName,
  getDefaultPlaceholderText,
  getPlaceholderOutputBaseName,
  normalizeHexColor,
  validatePlaceholderDimensions,
} from "./imagePlaceholder.service";

describe("imagePlaceholder.service", () => {
  it("validates dimensions", () => {
    expect(validatePlaceholderDimensions(800, 400)).toBeNull();
    expect(validatePlaceholderDimensions(0, 400)?.code).toBe("tools.errors.dimensionsNotPositive");
    expect(validatePlaceholderDimensions(800, -1)?.code).toBe("tools.errors.dimensionsNotPositive");
    expect(validatePlaceholderDimensions(Number.NaN, 400)?.code).toBe("tools.errors.dimensionsNotNumeric");
  });

  it("generates default text from dimensions", () => {
    expect(getDefaultPlaceholderText(800, 400)).toBe("800 x 400");
    expect(getDefaultPlaceholderText(1200, 630)).toBe("1200 x 630");
  });

  it("builds output file names", () => {
    expect(getPlaceholderOutputBaseName(800, 400)).toBe("placeholder-800x400");
    expect(buildPlaceholderFileName("placeholder-800x400", "png")).toBe("placeholder-800x400.png");
    expect(buildPlaceholderFileName("placeholder-800x400", "jpeg")).toBe("placeholder-800x400.jpg");
    expect(buildPlaceholderFileName("placeholder-800x400", "webp")).toBe("placeholder-800x400.webp");
  });

  it("normalizes hex colors", () => {
    expect(normalizeHexColor("#abc", "#000000")).toBe("#AABBCC");
    expect(normalizeHexColor("1a2b3c", "#000000")).toBe("#1A2B3C");
    expect(normalizeHexColor("not-a-color", "#000000")).toBe("#000000");
  });

  it("enforces side and pixel limits", () => {
    expect(validatePlaceholderDimensions(8001, 400)).toEqual({
      code: "tools.errors.dimensionsExceedMax",
      vars: { max: 8000 },
    });
    expect(validatePlaceholderDimensions(8000, 8000)).toBeNull();
  });
});
