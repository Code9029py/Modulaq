import { describe, expect, it } from "vitest";
import { validateRangeInput } from "./removePdfPages.service";

describe("validateRangeInput", () => {
  it("estado 'empty' cuando el input está vacío o solo espacios", () => {
    expect(validateRangeInput("", 10).state).toBe("empty");
    expect(validateRangeInput("   ", 10).state).toBe("empty");
  });

  it("'ok' con páginas dentro de rango", () => {
    const result = validateRangeInput("1,3", 10);
    expect(result.state).toBe("ok");
    if (result.state === "ok") {
      expect(result.pages).toEqual([1, 3]);
    }
  });

  it("error con código i18n cuando una página excede el total", () => {
    const result = validateRangeInput("6", 5);
    expect(result.state).toBe("error");
    if (result.state === "error") {
      expect(result.code).toBe("tools.errors.pageNotExists");
      expect(result.vars).toMatchObject({ page: 6, total: 5 });
    }
  });

  it("error con código i18n cuando el rango excede el total", () => {
    const result = validateRangeInput("2-9", 5);
    expect(result.state).toBe("error");
    if (result.state === "error") {
      expect(result.code).toBe("tools.errors.rangeEndExceeds");
    }
  });

  it("error si el formato es inválido", () => {
    const result = validateRangeInput("abc", 10);
    expect(result.state).toBe("error");
    if (result.state === "error") {
      expect(result.code).toBe("tools.errors.pageRangeInvalidFormat");
    }
  });

  it("error 'removeAllPages' si pediría eliminar todas las páginas", () => {
    const result = validateRangeInput("1,2,3", 3);
    expect(result.state).toBe("error");
    if (result.state === "error") {
      expect(result.code).toBe("tools.errors.removeAllPages");
    }
  });

  it("acepta 1-3 en un PDF de 5 páginas", () => {
    const result = validateRangeInput("1-3", 5);
    expect(result.state).toBe("ok");
  });
});
