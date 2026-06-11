import { describe, expect, it } from "vitest";
import { compareTexts } from "./compareTexts";

describe("compareTexts", () => {
  it("textos iguales devuelven todo sin cambios", () => {
    const result = compareTexts("a\nb\nc", "a\nb\nc", { mode: "lines" });
    expect(result.summary).toEqual({
      added: 0,
      removed: 0,
      unchanged: 3,
      totalDifferences: 0,
    });
    expect(result.entries.every((entry) => entry.type === "unchanged")).toBe(true);
  });

  it("ambos vacíos devuelven listado vacío", () => {
    const result = compareTexts("", "", { mode: "lines" });
    expect(result.entries).toEqual([]);
    expect(result.summary.totalDifferences).toBe(0);
  });

  it("solo texto A devuelve todo como eliminado", () => {
    const result = compareTexts("uno\ndos", "", { mode: "lines" });
    expect(result.summary.removed).toBe(2);
    expect(result.summary.added).toBe(0);
    expect(result.entries.map((entry) => entry.type)).toEqual(["removed", "removed"]);
  });

  it("solo texto B devuelve todo como agregado", () => {
    const result = compareTexts("", "uno\ndos", { mode: "lines" });
    expect(result.summary.added).toBe(2);
    expect(result.summary.removed).toBe(0);
    expect(result.entries.map((entry) => entry.type)).toEqual(["added", "added"]);
  });

  it("detecta línea agregada en el medio", () => {
    const result = compareTexts("a\nc", "a\nb\nc", { mode: "lines" });
    expect(result.summary.added).toBe(1);
    expect(result.summary.removed).toBe(0);
    expect(result.summary.unchanged).toBe(2);
    const types = result.entries.map((entry) => entry.type);
    expect(types).toEqual(["unchanged", "added", "unchanged"]);
  });

  it("detecta línea eliminada", () => {
    const result = compareTexts("a\nb\nc", "a\nc", { mode: "lines" });
    expect(result.summary.removed).toBe(1);
    expect(result.summary.added).toBe(0);
    const types = result.entries.map((entry) => entry.type);
    expect(types).toEqual(["unchanged", "removed", "unchanged"]);
  });

  it("compara por palabras", () => {
    const result = compareTexts("hola mundo", "hola universo", { mode: "words" });
    expect(result.mode).toBe("words");
    expect(result.summary.unchanged).toBe(1);
    expect(result.summary.added).toBe(1);
    expect(result.summary.removed).toBe(1);
  });

  it("ignoreCase trata mayúsculas y minúsculas como iguales", () => {
    const result = compareTexts("Hola", "hola", {
      mode: "words",
      ignoreCase: true,
    });
    expect(result.summary.unchanged).toBe(1);
    expect(result.summary.totalDifferences).toBe(0);
  });

  it("ignoreWhitespace normaliza espacios extra", () => {
    const left = "  uno   dos  ";
    const right = "uno dos";
    const result = compareTexts(left, right, {
      mode: "lines",
      ignoreWhitespace: true,
    });
    expect(result.summary.unchanged).toBe(1);
    expect(result.summary.totalDifferences).toBe(0);
  });

  it("totalDifferences = added + removed", () => {
    const result = compareTexts("a\nb", "a\nc", { mode: "lines" });
    expect(result.summary.totalDifferences).toBe(
      result.summary.added + result.summary.removed,
    );
  });
});
