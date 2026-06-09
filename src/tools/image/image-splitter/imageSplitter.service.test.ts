import { describe, expect, it } from "vitest";
import {
  buildSplitImageZipFileName,
  calculateImageSplitParts,
  getSplitImageOutputBaseName,
  getSplitPartFileName,
  validateImageSplitterOptions,
} from "./imageSplitter.service";

const imageDimensions = { width: 1000, height: 600 };

describe("imageSplitter.service", () => {
  it("calculates parts by rows and columns", () => {
    const parts = calculateImageSplitParts(imageDimensions, { mode: "grid", rows: 2, columns: 2 });

    expect(parts).toHaveLength(4);
    expect(parts[0]).toMatchObject({ x: 0, y: 0, width: 500, height: 300, row: 1, column: 1 });
    expect(parts[3]).toMatchObject({ x: 500, y: 300, width: 500, height: 300, row: 2, column: 2 });
  });

  it("calculates parts by fixed size", () => {
    const parts = calculateImageSplitParts({ width: 1000, height: 650 }, { mode: "fixed-size", partWidth: 400, partHeight: 300 });

    expect(parts).toHaveLength(9);
    expect(parts.at(-1)).toMatchObject({ x: 800, y: 600, width: 200, height: 50, row: 3, column: 3 });
  });

  it("validates rows and columns", () => {
    expect(validateImageSplitterOptions(imageDimensions, { mode: "grid", rows: 0, columns: 2 })).toEqual({
      code: "tools.errors.splitterRowsNotPositive",
    });
    expect(validateImageSplitterOptions(imageDimensions, { mode: "grid", rows: 2, columns: 0 })).toEqual({
      code: "tools.errors.splitterColumnsNotPositive",
    });
    expect(validateImageSplitterOptions(imageDimensions, { mode: "grid", rows: 2, columns: 2 })).toBeNull();
  });

  it("validates fixed width and height", () => {
    expect(validateImageSplitterOptions(imageDimensions, { mode: "fixed-size", partWidth: 0, partHeight: 300 })).toEqual({
      code: "tools.errors.splitterPartWidthNotPositive",
    });
    expect(validateImageSplitterOptions(imageDimensions, { mode: "fixed-size", partWidth: 300, partHeight: 0 })).toEqual({
      code: "tools.errors.splitterPartHeightNotPositive",
    });
    expect(validateImageSplitterOptions(imageDimensions, { mode: "fixed-size", partWidth: 300, partHeight: 300 })).toBeNull();
  });

  it("limits the maximum number of parts", () => {
    expect(validateImageSplitterOptions(imageDimensions, { mode: "grid", rows: 10, columns: 11 })).toEqual({
      code: "tools.errors.splitterExceedsParts",
      vars: { max: 100 },
    });
    expect(validateImageSplitterOptions(imageDimensions, { mode: "fixed-size", partWidth: 10, partHeight: 10 })).toEqual({
      code: "tools.errors.splitterExceedsParts",
      vars: { max: 100 },
    });
  });

  it("generates part names with the correct extension", () => {
    expect(getSplitPartFileName(1, 2, "png")).toBe("parte-f1-c2.png");
    expect(getSplitPartFileName(3, 4, "jpeg")).toBe("parte-f3-c4.jpg");
    expect(getSplitPartFileName(3, 4, "webp")).toBe("parte-f3-c4.webp");
  });

  it("keeps edge dimensions for non-divisible grid splits", () => {
    const parts = calculateImageSplitParts({ width: 1001, height: 601 }, { mode: "grid", rows: 2, columns: 3 });

    expect(parts[0]).toMatchObject({ width: 333, height: 300 });
    expect(parts[2]).toMatchObject({ x: 667, width: 334 });
    expect(parts[5]).toMatchObject({ y: 300, height: 301 });
  });

  it("builds the output ZIP name", () => {
    expect(getSplitImageOutputBaseName("foto.png")).toBe("foto-partes");
    expect(buildSplitImageZipFileName("foto-partes")).toBe("foto-partes.zip");
  });
});
