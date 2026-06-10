import { describe, expect, it } from "vitest";
import { countPdfPages } from "./countPdfPages";
import { removePdfPages } from "./removePdfPages";
import { loadPdfFixture } from "../../test-fixtures/load";

describe("removePdfPages", () => {
  it("remueve la página solicitada de un PDF de 3 páginas y deja 2", async () => {
    const source = loadPdfFixture("text-multi-3p.pdf");
    const result = await removePdfPages(source, [2]);
    expect(await countPdfPages(result)).toBe(2);
  });

  it("remueve múltiples páginas no contiguas", async () => {
    const source = loadPdfFixture("text-multi-5p.pdf");
    const result = await removePdfPages(source, [1, 3, 5]);
    expect(await countPdfPages(result)).toBe(2);
  });

  it("ignora duplicados en pagesToRemove", async () => {
    const source = loadPdfFixture("text-multi-3p.pdf");
    const result = await removePdfPages(source, [1, 1, 1]);
    expect(await countPdfPages(result)).toBe(2);
  });

  it("ignora números fuera de rango silenciosamente", async () => {
    const source = loadPdfFixture("text-multi-3p.pdf");
    const result = await removePdfPages(source, [99]);
    expect(await countPdfPages(result)).toBe(3);
  });

  it("lanza error si pediría eliminar todas las páginas", async () => {
    const source = loadPdfFixture("text-multi-3p.pdf");
    await expect(removePdfPages(source, [1, 2, 3])).rejects.toThrow();
  });

  it("lanza error en PDF de 1 página si esa página se incluye", async () => {
    const source = loadPdfFixture("text-simple-1p.pdf");
    await expect(removePdfPages(source, [1])).rejects.toThrow();
  });
});
