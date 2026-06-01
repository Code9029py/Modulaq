import { describe, expect, it } from "vitest";
import { countPdfPages } from "./countPdfPages";
import { reorderPdfPages } from "./reorderPdfPages";
import { loadPdfFixture } from "../../test-fixtures/load";

describe("reorderPdfPages", () => {
  it("orden válido [3,1,2] preserva la cantidad de páginas", async () => {
    const bytes = loadPdfFixture("text-multi-3p.pdf");
    const out = await reorderPdfPages(bytes, [3, 1, 2]);
    expect(await countPdfPages(out)).toBe(3);
  });

  it("orden permite repetir y reducir páginas (no se enforza completitud en el SDK)", async () => {
    // El SDK no exige que el orden cubra todas las páginas: deja esa regla al consumidor.
    const bytes = loadPdfFixture("text-multi-5p.pdf");
    const out = await reorderPdfPages(bytes, [1, 1, 2]);
    expect(await countPdfPages(out)).toBe(3);
  });

  it("orden vacío lanza error", async () => {
    const bytes = loadPdfFixture("text-multi-3p.pdf");
    await expect(reorderPdfPages(bytes, [])).rejects.toThrow();
  });

  it("orden con páginas fuera de rango lanza error", async () => {
    const bytes = loadPdfFixture("text-multi-3p.pdf");
    await expect(reorderPdfPages(bytes, [1, 99])).rejects.toThrow();
  });
});
