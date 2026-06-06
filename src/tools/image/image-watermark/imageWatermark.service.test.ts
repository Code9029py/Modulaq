import { describe, expect, it } from "vitest";
import {
  buildWatermarkedImageFileName,
  calculateWatermarkPosition,
  getWatermarkedImageOutputBaseName,
  normalizeHexColor,
  validateWatermarkFontSize,
  validateWatermarkMargin,
  validateWatermarkOpacity,
} from "./imageWatermark.service";

const imageDimensions = { width: 1000, height: 600 };
const textDimensions = { width: 200, height: 50 };

describe("imageWatermark.service", () => {
  it("calculates top-left watermark position", () => {
    expect(calculateWatermarkPosition(imageDimensions, textDimensions, "top-left", 20)).toEqual({ x: 20, y: 20 });
  });

  it("calculates top-right watermark position", () => {
    expect(calculateWatermarkPosition(imageDimensions, textDimensions, "top-right", 20)).toEqual({ x: 780, y: 20 });
  });

  it("calculates centered watermark position", () => {
    expect(calculateWatermarkPosition(imageDimensions, textDimensions, "center", 20)).toEqual({ x: 400, y: 275 });
  });

  it("calculates bottom positions with margin", () => {
    expect(calculateWatermarkPosition(imageDimensions, textDimensions, "bottom-left", 20)).toEqual({ x: 20, y: 530 });
    expect(calculateWatermarkPosition(imageDimensions, textDimensions, "bottom-right", 20)).toEqual({ x: 780, y: 530 });
  });

  it("validates opacity", () => {
    expect(validateWatermarkOpacity(0.1)).toBeNull();
    expect(validateWatermarkOpacity(1)).toBeNull();
    expect(validateWatermarkOpacity(0)).toMatch(/10%/);
    expect(validateWatermarkOpacity(1.1)).toMatch(/100%/);
  });

  it("validates font size", () => {
    expect(validateWatermarkFontSize(48)).toBeNull();
    expect(validateWatermarkFontSize(7)).toMatch(/8/);
    expect(validateWatermarkFontSize(513)).toMatch(/512/);
    expect(validateWatermarkFontSize(12.5)).toMatch(/entero/);
  });

  it("validates margin", () => {
    expect(validateWatermarkMargin(0)).toBeNull();
    expect(validateWatermarkMargin(24)).toBeNull();
    expect(validateWatermarkMargin(-1)).toMatch(/margen/);
    expect(validateWatermarkMargin(1.5)).toMatch(/entero/);
  });

  it("builds output names", () => {
    expect(getWatermarkedImageOutputBaseName("foto.png")).toBe("foto-marca-agua");
    expect(buildWatermarkedImageFileName("foto-marca-agua", "png")).toBe("foto-marca-agua.png");
    expect(buildWatermarkedImageFileName("foto-marca-agua", "jpeg")).toBe("foto-marca-agua.jpg");
    expect(buildWatermarkedImageFileName("foto-marca-agua", "webp")).toBe("foto-marca-agua.webp");
  });

  it("normalizes hex colors", () => {
    expect(normalizeHexColor("#abc")).toBe("#AABBCC");
    expect(normalizeHexColor("123456")).toBe("#123456");
  });
});
