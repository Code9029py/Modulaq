import { describe, expect, it } from "vitest";
import {
  previewPageNumberLabel,
  STARTING_NUMBER_MAX,
  validateAddPageNumbersOptions,
} from "./addPageNumbers.service";
import type { AddPageNumbersFormOptions } from "./addPageNumbers.types";

function makeOptions(overrides: Partial<AddPageNumbersFormOptions> = {}): AddPageNumbersFormOptions {
  return {
    position: "bottom-center",
    format: "n-of-total",
    startPage: 1,
    startingNumber: 1,
    ...overrides,
  };
}

describe("previewPageNumberLabel", () => {
  it("formato solo número", () => {
    expect(previewPageNumberLabel("n", "es", 3, 10)).toBe("3");
    expect(previewPageNumberLabel("n", "en", 3, 10)).toBe("3");
  });

  it("formato n / total", () => {
    expect(previewPageNumberLabel("n-of-total", "es", 1, 5)).toBe("1 / 5");
    expect(previewPageNumberLabel("n-of-total", "en", 1, 5)).toBe("1 / 5");
  });

  it("formato Página / Page", () => {
    expect(previewPageNumberLabel("page-n", "es", 1, 5)).toBe("Página 1");
    expect(previewPageNumberLabel("page-n", "en", 1, 5)).toBe("Page 1");
  });

  it("formato Página/Page con total", () => {
    expect(previewPageNumberLabel("page-n-of-total", "es", 2, 8)).toBe("Página 2 de 8");
    expect(previewPageNumberLabel("page-n-of-total", "en", 2, 8)).toBe("Page 2 of 8");
  });

  it("formato Pág/p. abreviado", () => {
    expect(previewPageNumberLabel("pag-n", "es", 7, 9)).toBe("Pág. 7");
    expect(previewPageNumberLabel("pag-n", "en", 7, 9)).toBe("p. 7");
  });

  it("formato Pág/p. abreviado con total", () => {
    expect(previewPageNumberLabel("pag-n-of-total", "es", 7, 9)).toBe("Pág. 7 de 9");
    expect(previewPageNumberLabel("pag-n-of-total", "en", 7, 9)).toBe("p. 7 of 9");
  });
});

describe("validateAddPageNumbersOptions", () => {
  it("ok con valores válidos", () => {
    expect(validateAddPageNumbersOptions(makeOptions(), 10)).toBeNull();
  });

  it("rechaza startPage inválido (NaN)", () => {
    expect(validateAddPageNumbersOptions(makeOptions({ startPage: NaN }), 10)).toMatchObject({
      code: "tools.errors.startPageInvalid",
    });
  });

  it("rechaza startPage < 1", () => {
    expect(validateAddPageNumbersOptions(makeOptions({ startPage: 0 }), 10)).toMatchObject({
      code: "tools.errors.startPageInvalid",
    });
  });

  it("rechaza startPage > totalPages", () => {
    expect(validateAddPageNumbersOptions(makeOptions({ startPage: 11 }), 10)).toMatchObject({
      code: "tools.errors.startPageOutOfRange",
      vars: { total: 10 },
    });
  });

  it("rechaza startPage no entero", () => {
    expect(validateAddPageNumbersOptions(makeOptions({ startPage: 2.5 }), 10)).toMatchObject({
      code: "tools.errors.startPageInvalid",
    });
  });

  it("rechaza startingNumber inválido (NaN)", () => {
    expect(
      validateAddPageNumbersOptions(makeOptions({ startingNumber: NaN }), 10),
    ).toMatchObject({ code: "tools.errors.startingNumberInvalid" });
  });

  it("rechaza startingNumber < 1", () => {
    expect(
      validateAddPageNumbersOptions(makeOptions({ startingNumber: 0 }), 10),
    ).toMatchObject({ code: "tools.errors.startingNumberInvalid" });
  });

  it(`rechaza startingNumber > ${STARTING_NUMBER_MAX}`, () => {
    expect(
      validateAddPageNumbersOptions(makeOptions({ startingNumber: STARTING_NUMBER_MAX + 1 }), 10),
    ).toMatchObject({ code: "tools.errors.startingNumberOutOfRange" });
  });
});
