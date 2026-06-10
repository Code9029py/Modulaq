import { describe, expect, it } from "vitest";
import {
  buildSvgPngFileName,
  extractSvgDimensions,
  getDefaultSvgOutputDimensions,
  getSvgPngOutputBaseName,
  hasExternalSvgResources,
  hasSvgScript,
  looksLikeSvg,
  validateSvgContent,
  validateSvgOutputDimensions,
} from "./svgToPng.service";

describe("svgToPng.service", () => {
  it("detects valid SVG content", () => {
    expect(looksLikeSvg('<svg width="10" height="10"></svg>')).toBe(true);
    expect(validateSvgContent('<svg viewBox="0 0 10 10"><path /></svg>')).toBeNull();
  });

  it("rejects content without SVG", () => {
    expect(looksLikeSvg("<div>Nope</div>")).toBe(false);
    expect(validateSvgContent("<div>Nope</div>")?.code).toBe("tools.errors.invalidSvg");
  });

  it("detects scripts", () => {
    const svg = '<svg width="10" height="10"><script>alert(1)</script></svg>';
    expect(hasSvgScript(svg)).toBe(true);
    expect(validateSvgContent(svg)?.code).toBe("tools.errors.svgContainsScript");
  });

  it("extracts width and height", () => {
    expect(extractSvgDimensions('<svg width="320" height="180"></svg>')).toMatchObject({
      height: 180,
      width: 320,
    });
    expect(extractSvgDimensions('<svg width="320px" height="180px"></svg>')).toMatchObject({
      height: 180,
      width: 320,
    });
  });

  it("extracts viewBox dimensions", () => {
    expect(extractSvgDimensions('<svg viewBox="0 0 640 360"></svg>')).toEqual({
      height: 360,
      viewBox: { height: 360, minX: 0, minY: 0, width: 640 },
      width: 640,
    });
  });

  it("calculates default output dimensions", () => {
    expect(getDefaultSvgOutputDimensions(extractSvgDimensions('<svg width="240" height="120"></svg>'))).toEqual({
      height: 120,
      width: 240,
    });
    expect(getDefaultSvgOutputDimensions({ height: null, viewBox: null, width: null })).toEqual({
      height: 512,
      width: 512,
    });
  });

  it("validates output dimensions", () => {
    expect(validateSvgOutputDimensions(800, 400)).toBeNull();
    expect(validateSvgOutputDimensions(0, 400)?.code).toBe("tools.errors.dimensionsNotPositive");
    expect(validateSvgOutputDimensions(800, Number.NaN)?.code).toBe("tools.errors.dimensionsNotNumeric");
    expect(validateSvgOutputDimensions(800.5, 400)?.code).toBe("tools.errors.dimensionsNotInteger");
    expect(validateSvgOutputDimensions(8001, 400)?.code).toBe("tools.errors.dimensionsExceedMax");
  });

  it("builds final PNG names", () => {
    expect(getSvgPngOutputBaseName("logo.svg")).toBe("logo");
    expect(getSvgPngOutputBaseName(null)).toBe("svg-to-png");
    expect(buildSvgPngFileName("logo")).toBe("logo.png");
    expect(buildSvgPngFileName("", "svg-to-png")).toBe("svg-to-png.png");
  });

  it("detects external resources", () => {
    expect(hasExternalSvgResources('<svg><image href="https://example.com/a.png" /></svg>')).toBe(true);
    expect(hasExternalSvgResources("<svg><rect fill=\"url(//example.com/a.svg#id)\" /></svg>")).toBe(true);
  });
});
