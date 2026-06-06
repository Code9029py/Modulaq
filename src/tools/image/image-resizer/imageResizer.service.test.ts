import { describe, expect, it } from "vitest";
import {
  buildResizedImageFileName,
  calculateResizeDimensions,
  getResizedImageOutputBaseName,
  maxImageDimension,
  validateImageDimensions,
} from "./imageResizer.service";

const original = { width: 1200, height: 800 };

describe("imageResizer.service", () => {
  it("calculates height from width when preserving aspect ratio", () => {
    expect(calculateResizeDimensions(original, "width", 600, true)).toEqual({
      width: 600,
      height: 400,
    });
  });

  it("calculates width from height when preserving aspect ratio", () => {
    expect(calculateResizeDimensions(original, "height", 200, true)).toEqual({
      width: 300,
      height: 200,
    });
  });

  it("calculates dimensions from scale percentage", () => {
    expect(calculateResizeDimensions(original, "scale", 50, true)).toEqual({
      width: 600,
      height: 400,
    });
    expect(calculateResizeDimensions(original, "scale", 200, true)).toEqual({
      width: 2400,
      height: 1600,
    });
  });

  it("allows independent custom dimensions", () => {
    expect(calculateResizeDimensions(original, "custom", 640, false, 360)).toEqual({
      width: 640,
      height: 360,
    });
  });

  it("validates invalid dimensions", () => {
    expect(validateImageDimensions({ width: 0, height: 100 })).toBeTruthy();
    expect(validateImageDimensions({ width: -1, height: 100 })).toBeTruthy();
    expect(validateImageDimensions({ width: Number.NaN, height: 100 })).toBeTruthy();
    expect(validateImageDimensions({ width: 10.5, height: 100 })).toBeTruthy();
  });

  it("validates maximum dimension and pixel limits", () => {
    expect(validateImageDimensions({ width: maxImageDimension + 1, height: 100 })).toBeTruthy();
    expect(validateImageDimensions({ width: 8000, height: 8000 })).toBeNull();
    expect(validateImageDimensions({ width: 8000, height: 8001 })).toBeTruthy();
  });

  it("builds resized output names with the selected extension", () => {
    expect(getResizedImageOutputBaseName("foto.png")).toBe("foto-redimensionada");
    expect(buildResizedImageFileName("foto-redimensionada", "jpeg")).toBe("foto-redimensionada.jpg");
    expect(buildResizedImageFileName("foto-redimensionada", "png")).toBe("foto-redimensionada.png");
    expect(buildResizedImageFileName("foto-redimensionada", "webp")).toBe("foto-redimensionada.webp");
  });
});
