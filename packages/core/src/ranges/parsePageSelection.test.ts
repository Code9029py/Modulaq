import { describe, expect, it } from "vitest";
import { parsePageSelection } from "./parsePageSelection";

describe("parsePageSelection", () => {
  it("lista simple '1,2,3' devuelve las páginas en orden", () => {
    expect(parsePageSelection("1,2,3", 10)).toEqual({ error: null, isOutOfOrder: false, pages: [1, 2, 3] });
  });

  it("mezcla rangos y dígitos '1-3,5'", () => {
    expect(parsePageSelection("1-3,5", 10)).toEqual({ error: null, isOutOfOrder: false, pages: [1, 2, 3, 5] });
  });

  it("deduplica páginas repetidas", () => {
    expect(parsePageSelection("1,1,2", 10).pages).toEqual([1, 2]);
  });

  it("marca isOutOfOrder cuando el orden no es ascendente", () => {
    expect(parsePageSelection("5,1", 10)).toMatchObject({ error: null, isOutOfOrder: true, pages: [5, 1] });
  });

  it("rango invertido '5-1' es error", () => {
    const result = parsePageSelection("5-1", 10);
    expect(result.error).toBeTruthy();
    expect(result.pages).toEqual([]);
  });

  it("rango fuera de los límites del PDF es error", () => {
    expect(parsePageSelection("1-20", 10).error).toBeTruthy();
  });

  it("input vacío es error", () => {
    expect(parsePageSelection("", 10).error).toBeTruthy();
  });

  it("token inválido es error", () => {
    expect(parsePageSelection("abc", 10).error).toBeTruthy();
  });

  it("rango de una sola página '5-5' devuelve [5]", () => {
    expect(parsePageSelection("5-5", 10).pages).toEqual([5]);
  });

  it("tolera espacios alrededor de rangos: '1 - 3'", () => {
    expect(parsePageSelection("1 - 3", 10).pages).toEqual([1, 2, 3]);
  });
});
