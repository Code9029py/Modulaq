import { describe, expect, it } from "vitest";
import {
  buildCompressedImageFileName,
  calculateImageSizeChange,
  getCompressedImageOutputBaseName,
} from "./imageCompressor.service";

describe("imageCompressor.service", () => {
  it("calculates image size reduction", () => {
    expect(calculateImageSizeChange(1000, 600)).toEqual({
      deltaBytes: 400,
      direction: "reduction",
      percentage: 40,
    });
  });

  it("calculates image size increase", () => {
    expect(calculateImageSizeChange(1000, 1250)).toEqual({
      deltaBytes: -250,
      direction: "increase",
      percentage: 25,
    });
  });

  it("handles equal or invalid original sizes", () => {
    expect(calculateImageSizeChange(1000, 1000)).toEqual({
      deltaBytes: 0,
      direction: "same",
      percentage: 0,
    });
    expect(calculateImageSizeChange(0, 100)).toEqual({
      deltaBytes: -100,
      direction: "increase",
      percentage: 0,
    });
  });

  it("builds compressed output names with the selected extension", () => {
    expect(getCompressedImageOutputBaseName("foto.png")).toBe("foto-comprimida");
    expect(buildCompressedImageFileName("foto-comprimida", "jpeg")).toBe("foto-comprimida.jpg");
    expect(buildCompressedImageFileName("foto-comprimida", "webp")).toBe("foto-comprimida.webp");
    expect(buildCompressedImageFileName("foto-comprimida", "png")).toBe("foto-comprimida.png");
  });
});
