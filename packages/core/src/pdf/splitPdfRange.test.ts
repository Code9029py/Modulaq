import { describe, expect, it } from "vitest";
import { countPdfPages } from "./countPdfPages";
import { splitPdfRange } from "./splitPdfRange";
import { loadPdfFixture } from "../../test-fixtures/load";

describe("splitPdfRange", () => {
  it("rango 2..4 de un PDF de 5 páginas devuelve 3 páginas", async () => {
    const bytes = loadPdfFixture("text-multi-5p.pdf");
    const out = await splitPdfRange(bytes, { from: 2, to: 4 });
    expect(await countPdfPages(out)).toBe(3);
  });

  it("rango de una sola página (3..3) devuelve 1 página", async () => {
    const bytes = loadPdfFixture("text-multi-5p.pdf");
    const out = await splitPdfRange(bytes, { from: 3, to: 3 });
    expect(await countPdfPages(out)).toBe(1);
  });

  it("rango con from < 1 lanza error", async () => {
    const bytes = loadPdfFixture("text-multi-5p.pdf");
    await expect(splitPdfRange(bytes, { from: 0, to: 3 })).rejects.toThrow();
  });

  it("rango invertido lanza error", async () => {
    const bytes = loadPdfFixture("text-multi-5p.pdf");
    await expect(splitPdfRange(bytes, { from: 4, to: 2 })).rejects.toThrow();
  });
});
