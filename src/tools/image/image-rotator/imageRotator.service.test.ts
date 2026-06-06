import { describe, expect, it } from "vitest";
import {
  applyImageRotatorAction,
  buildRotatedImageFileName,
  defaultTransform,
  getRotatedImageOutputBaseName,
  getTransformedImageDimensions,
  isImageRotatorAction,
} from "./imageRotator.service";

describe("imageRotator.service", () => {
  it("swaps width and height after a 90 degree rotation", () => {
    const transform = applyImageRotatorAction(defaultTransform, "rotate-right");

    expect(getTransformedImageDimensions({ width: 1200, height: 800 }, transform)).toEqual({
      height: 1200,
      width: 800,
    });
  });

  it("keeps dimensions after a 180 degree rotation", () => {
    const transform = applyImageRotatorAction(defaultTransform, "rotate-180");

    expect(getTransformedImageDimensions({ width: 1200, height: 800 }, transform)).toEqual({
      height: 800,
      width: 1200,
    });
  });

  it("keeps dimensions after horizontal and vertical flips", () => {
    const horizontal = applyImageRotatorAction(defaultTransform, "flip-horizontal");
    const vertical = applyImageRotatorAction(defaultTransform, "flip-vertical");

    expect(getTransformedImageDimensions({ width: 640, height: 480 }, horizontal)).toEqual({
      height: 480,
      width: 640,
    });
    expect(getTransformedImageDimensions({ width: 640, height: 480 }, vertical)).toEqual({
      height: 480,
      width: 640,
    });
  });

  it("validates known actions", () => {
    expect(isImageRotatorAction("rotate-left")).toBe(true);
    expect(isImageRotatorAction("flip-vertical")).toBe(true);
    expect(isImageRotatorAction("crop")).toBe(false);
  });

  it("builds output names with the selected format", () => {
    expect(getRotatedImageOutputBaseName("foto original.png")).toBe("foto original-rotada");
    expect(buildRotatedImageFileName("foto original-rotada", "jpeg")).toBe("foto original-rotada.jpg");
    expect(buildRotatedImageFileName("foto original-rotada", "webp")).toBe("foto original-rotada.webp");
  });

  it("combines rotation and flips cleanly", () => {
    const rotated = applyImageRotatorAction(defaultTransform, "rotate-right");
    const transformed = applyImageRotatorAction(rotated, "flip-horizontal");

    expect(transformed).toEqual({
      flipHorizontal: true,
      flipVertical: false,
      rotation: 90,
    });
    expect(getTransformedImageDimensions({ width: 300, height: 500 }, transformed)).toEqual({
      height: 300,
      width: 500,
    });
  });
});
