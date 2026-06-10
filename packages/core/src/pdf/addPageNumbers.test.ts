import { describe, expect, it } from "vitest";
import { addPageNumbers } from "./addPageNumbers";
import { countPdfPages } from "./countPdfPages";
import { loadPdfFixture } from "../../test-fixtures/load";

describe("addPageNumbers", () => {
  it("conserva la cantidad de páginas y devuelve un PDF válido", async () => {
    const source = loadPdfFixture("text-multi-3p.pdf");
    const result = await addPageNumbers(source);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBeGreaterThan(0);
    expect(await countPdfPages(result)).toBe(3);
  });

  it("funciona en PDF de 1 página", async () => {
    const source = loadPdfFixture("text-simple-1p.pdf");
    const result = await addPageNumbers(source, { position: "bottom-right" });
    expect(await countPdfPages(result)).toBe(1);
  });

  it("acepta las tres posiciones soportadas sin romper", async () => {
    const source = loadPdfFixture("text-multi-3p.pdf");
    for (const position of ["bottom-left", "bottom-center", "bottom-right"] as const) {
      const result = await addPageNumbers(source, { position });
      expect(await countPdfPages(result)).toBe(3);
    }
  });

  it("respeta una template custom con {n} y {total}", async () => {
    const source = loadPdfFixture("text-multi-5p.pdf");
    const result = await addPageNumbers(source, { template: "Pag. {n} de {total}" });
    expect(await countPdfPages(result)).toBe(5);
  });
});
