import { describe, expect, it } from "vitest";
import { validateParts } from "./pageRanges";

describe("validateParts (shared/utils/pageRanges)", () => {
  it("partición completa, sin solapamiento, sin huecos → isValid", () => {
    const result = validateParts(["1-2", "3", "4-5"], 5);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
    expect(result.assignedPageCount).toBe(5);
    expect(result.missingPages).toEqual([]);
    expect(result.repeatedPages).toEqual([]);
  });

  it("una parte vacía es error claro", () => {
    const result = validateParts(["1-2", "", "4-5"], 5);
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/vacía/);
  });

  it("páginas repetidas entre partes son error", () => {
    const result = validateParts(["1-3", "3-5"], 5);
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/asignada/);
    expect(result.repeatedPages).toContain(3);
  });

  it("falta una página → error", () => {
    const result = validateParts(["1-2", "4-5"], 5);
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Falta/);
    expect(result.missingPages).toEqual([3]);
  });

  it("faltan varias páginas → mensaje plural", () => {
    const result = validateParts(["1"], 5);
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/Falta(n)?\s+asignar:/);
    expect(result.missingPages).toEqual([2, 3, 4, 5]);
  });

  it("token inválido dentro de una parte → error", () => {
    const result = validateParts(["1-2", "abc"], 5);
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("una parte con duplicado interno (rejectDuplicates) → error", () => {
    const result = validateParts(["1,1", "2-5"], 5);
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/repetida/i);
  });
});
