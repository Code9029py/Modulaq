import { describe, expect, it } from "vitest";
import {
  buildPaletteFileName,
  calculateSampleDimensions,
  exportPaletteAsJson,
  exportPaletteAsTxt,
  extractDominantColorsFromImageData,
  formatRgb,
  getPaletteOutputBaseName,
  quantizeRgb,
  rgbToHex,
} from "./imageColorExtractor.service";

function pixel(r: number, g: number, b: number, a = 255) {
  return [r, g, b, a];
}

describe("imageColorExtractor.service", () => {
  it("converts RGB to HEX", () => {
    expect(rgbToHex({ r: 255, g: 128, b: 0 })).toBe("#FF8000");
    expect(rgbToHex({ r: 0, g: 1, b: 15 })).toBe("#00010F");
  });

  it("formats RGB", () => {
    expect(formatRgb({ r: 12, g: 34, b: 56 })).toBe("rgb(12, 34, 56)");
  });

  it("bucketizes RGB values", () => {
    expect(quantizeRgb({ r: 31, g: 32, b: 255 })).toEqual({ r: 0, g: 1, b: 7 });
  });

  it("orders colors by frequency", () => {
    const data = new Uint8ClampedArray([
      ...pixel(255, 0, 0),
      ...pixel(255, 5, 5),
      ...pixel(0, 0, 255),
    ]);

    const result = extractDominantColorsFromImageData(data, { colorCount: 2 });
    expect(result.colors).toHaveLength(2);
    expect(result.colors[0].hex).toBe("#FF0303");
    expect(result.colors[0].count).toBe(2);
  });

  it("ignores fully transparent pixels", () => {
    const data = new Uint8ClampedArray([
      ...pixel(255, 0, 0, 0),
      ...pixel(0, 0, 255, 255),
    ]);

    const result = extractDominantColorsFromImageData(data, { colorCount: 4 });
    expect(result.sampledPixels).toBe(1);
    expect(result.colors[0].hex).toBe("#0000FF");
  });

  it("limits the requested color count", () => {
    const data = new Uint8ClampedArray([
      ...pixel(255, 0, 0),
      ...pixel(0, 255, 0),
      ...pixel(0, 0, 255),
      ...pixel(255, 255, 0),
      ...pixel(0, 255, 255),
    ]);

    expect(extractDominantColorsFromImageData(data, { colorCount: 4 }).colors).toHaveLength(4);
  });

  it("accepts custom color counts between presets", () => {
    const data = new Uint8ClampedArray([
      ...pixel(255, 0, 0),
      ...pixel(0, 255, 0),
      ...pixel(0, 0, 255),
      ...pixel(255, 255, 0),
      ...pixel(0, 255, 255),
      ...pixel(255, 0, 255),
    ]);

    expect(extractDominantColorsFromImageData(data, { colorCount: 5 }).colors).toHaveLength(5);
  });


  it("does not pad dominant colors beyond detected buckets", () => {
    const data = new Uint8ClampedArray([
      ...pixel(255, 0, 0),
      ...pixel(0, 255, 0),
      ...pixel(0, 0, 255),
    ]);

    expect(extractDominantColorsFromImageData(data, { colorCount: 12 }).colors).toHaveLength(3);
  });

  it("exports TXT and JSON palettes", () => {
    const colors = [
      { count: 2, hex: "#FF0000", percentage: 66.666, rgb: { r: 255, g: 0, b: 0 } },
    ];

    expect(exportPaletteAsTxt(colors)).toContain("#FF0000 | rgb(255, 0, 0) | 66.7%");
    expect(exportPaletteAsJson(colors)).toContain('"percentage": 66.67');
  });

  it("calculates sample dimensions under the pixel limit", () => {
    expect(calculateSampleDimensions(1000, 1000, 10_000)).toEqual({ width: 100, height: 100 });
    expect(calculateSampleDimensions(80, 60, 10_000)).toEqual({ width: 80, height: 60 });
  });

  it("builds palette output names", () => {
    expect(getPaletteOutputBaseName("marca.png")).toBe("marca-colores");
    expect(buildPaletteFileName("marca-colores", "json")).toBe("marca-colores.json");
  });
});
