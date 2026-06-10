import { describe, expect, it } from "vitest";
import {
  buildJoinedImageFileName,
  calculateImageJoinerLayout,
  getJoinedImageOutputBaseName,
  validateImageJoinerOptions,
} from "./imageJoiner.service";
import type { ImageJoinerLayoutOptions, ImageJoinerSource } from "./imageJoiner.types";

const images: ImageJoinerSource[] = [
  { id: "a", width: 100, height: 80 },
  { id: "b", width: 60, height: 120 },
  { id: "c", width: 140, height: 50 },
];

const baseOptions: ImageJoinerLayoutOptions = {
  backgroundColor: "#ffffff",
  columns: 2,
  mode: "vertical",
  padding: 10,
  spacing: 5,
};

describe("imageJoiner.service", () => {
  it("calculates a vertical canvas", () => {
    expect(calculateImageJoinerLayout(images, baseOptions)).toMatchObject({
      width: 160,
      height: 280,
    });
  });

  it("calculates a horizontal canvas", () => {
    expect(calculateImageJoinerLayout(images, { ...baseOptions, mode: "horizontal" })).toMatchObject({
      width: 330,
      height: 140,
    });
  });

  it("calculates a grid canvas", () => {
    expect(calculateImageJoinerLayout(images, { ...baseOptions, mode: "grid", columns: 2 })).toMatchObject({
      width: 305,
      height: 265,
    });
  });

  it("returns image positions", () => {
    expect(calculateImageJoinerLayout(images, baseOptions).positions).toEqual([
      { id: "a", x: 30, y: 10, width: 100, height: 80 },
      { id: "b", x: 50, y: 95, width: 60, height: 120 },
      { id: "c", x: 10, y: 220, width: 140, height: 50 },
    ]);
  });

  it("validates grid columns", () => {
    expect(validateImageJoinerOptions(images, { ...baseOptions, mode: "grid", columns: 0 })).toEqual({
      code: "tools.errors.joinerColumnsTooFew",
    });
    expect(validateImageJoinerOptions(images, { ...baseOptions, mode: "grid", columns: 4 })).toEqual({
      code: "tools.errors.joinerColumnsExceed",
    });
    expect(validateImageJoinerOptions(images, { ...baseOptions, mode: "grid", columns: 2 })).toBeNull();
  });

  it("validates padding and spacing", () => {
    expect(validateImageJoinerOptions(images, { ...baseOptions, spacing: -1 })).toEqual({
      code: "tools.errors.joinerSpacingNegative",
    });
    expect(validateImageJoinerOptions(images, { ...baseOptions, padding: -1 })).toEqual({
      code: "tools.errors.joinerPaddingNegative",
    });
    expect(validateImageJoinerOptions(images, { ...baseOptions, spacing: 1.5 })).toEqual({
      code: "tools.errors.joinerSpacingNotInteger",
    });
  });

  it("validates the background color", () => {
    expect(validateImageJoinerOptions(images, { ...baseOptions, backgroundColor: "white" })).toEqual({
      code: "tools.errors.joinerInvalidBgColor",
    });
  });

  it("builds the output name with the correct extension", () => {
    expect(getJoinedImageOutputBaseName("foto.png")).toBe("foto-unidas");
    expect(buildJoinedImageFileName("foto-unidas", "jpeg")).toBe("foto-unidas.jpg");
  });
});
