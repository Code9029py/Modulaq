import { describe, expect, it } from "vitest";
import { countPdfPages } from "./countPdfPages";
import { garbageBytes, loadPdfFixture } from "../../test-fixtures/load";

describe("countPdfPages", () => {
  it("PDF de 1 página devuelve 1", async () => {
    expect(await countPdfPages(loadPdfFixture("text-simple-1p.pdf"))).toBe(1);
  });

  it("PDF de 3 páginas devuelve 3", async () => {
    expect(await countPdfPages(loadPdfFixture("text-multi-3p.pdf"))).toBe(3);
  });

  it("PDF de 5 páginas devuelve 5", async () => {
    expect(await countPdfPages(loadPdfFixture("text-multi-5p.pdf"))).toBe(5);
  });

  it("bytes inválidos lanzan error", async () => {
    await expect(countPdfPages(garbageBytes())).rejects.toThrow();
  });
});
