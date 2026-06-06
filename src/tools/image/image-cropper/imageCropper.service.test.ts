import { describe, expect, it } from "vitest";
import {
  createCenteredCropRect,
  createCenteredSquareCropRect,
  getCropOutputDimensions,
  validateCropRect,
} from "./imageCropper.service";

const imageDimensions = { width: 1200, height: 800 };

describe("imageCropper.service", () => {
  it("accepts a valid crop rectangle", () => {
    expect(validateCropRect({ x: 100, y: 50, width: 400, height: 300 }, imageDimensions)).toBeNull();
  });

  it("rejects negative X or Y", () => {
    expect(validateCropRect({ x: -1, y: 0, width: 400, height: 300 }, imageDimensions)).toMatch(/negativos/);
    expect(validateCropRect({ x: 0, y: -1, width: 400, height: 300 }, imageDimensions)).toMatch(/negativos/);
  });

  it("rejects zero width or height", () => {
    expect(validateCropRect({ x: 0, y: 0, width: 0, height: 300 }, imageDimensions)).toMatch(/mayores que cero/);
    expect(validateCropRect({ x: 0, y: 0, width: 400, height: 0 }, imageDimensions)).toMatch(/mayores que cero/);
  });

  it("rejects crop rectangles outside image bounds", () => {
    expect(validateCropRect({ x: 900, y: 0, width: 400, height: 300 }, imageDimensions)).toMatch(/salirse/);
    expect(validateCropRect({ x: 0, y: 700, width: 400, height: 300 }, imageDimensions)).toMatch(/salirse/);
  });

  it("creates a centered square crop", () => {
    expect(createCenteredSquareCropRect(imageDimensions)).toEqual({
      height: 800,
      width: 800,
      x: 200,
      y: 0,
    });
  });

  it("creates a centered crop with custom dimensions", () => {
    expect(createCenteredCropRect(imageDimensions, { width: 600, height: 400 })).toEqual({
      height: 400,
      width: 600,
      x: 300,
      y: 200,
    });
  });

  it("returns final dimensions from the crop rectangle", () => {
    expect(getCropOutputDimensions({ x: 10, y: 20, width: 320, height: 240 })).toEqual({
      height: 240,
      width: 320,
    });
  });
});
