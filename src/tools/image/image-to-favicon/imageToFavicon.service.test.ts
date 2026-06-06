import { describe, expect, it } from "vitest";
import {
  buildFaviconZipFileName,
  createFaviconPackReadme,
  getFaviconIconSpecs,
  getFaviconOutputBaseName,
  validateFaviconSourceDimensions,
} from "./imageToFavicon.service";

describe("imageToFavicon.service", () => {
  it("returns the generated icon sizes", () => {
    expect(getFaviconIconSpecs().map((icon) => icon.size)).toEqual([16, 32, 48, 180, 192, 512]);
  });

  it("returns the expected file names", () => {
    expect(getFaviconIconSpecs().map((icon) => icon.fileName)).toEqual([
      "favicon-16x16.png",
      "favicon-32x32.png",
      "favicon-48x48.png",
      "apple-touch-icon.png",
      "icon-192.png",
      "icon-512.png",
    ]);
  });

  it("accepts a valid source size", () => {
    expect(validateFaviconSourceDimensions({ width: 1200, height: 800 })).toBeNull();
  });

  it("rejects invalid source dimensions", () => {
    expect(validateFaviconSourceDimensions({ width: 0, height: 800 })).toMatch(/mayores que cero/);
    expect(validateFaviconSourceDimensions({ width: 1200, height: -1 })).toMatch(/mayores que cero/);
    expect(validateFaviconSourceDimensions({ width: Number.NaN, height: 800 })).toMatch(/validas/);
  });

  it("rejects unreasonably large source dimensions", () => {
    expect(validateFaviconSourceDimensions({ width: 10000, height: 10000 })).toMatch(/64 megapixeles/);
  });

  it("builds output names derived from the original file", () => {
    expect(getFaviconOutputBaseName("marca.png")).toBe("marca-favicon");
    expect(buildFaviconZipFileName("marca-favicon")).toBe("marca-favicon.zip");
  });

  it("generates README metadata for the pack", () => {
    const readme = createFaviconPackReadme();
    expect(readme).toContain("favicon-32x32.png");
    expect(readme).toContain("<link rel=\"icon\"");
    expect(readme).toContain("No incluye un archivo .ico clasico.");
  });
});
