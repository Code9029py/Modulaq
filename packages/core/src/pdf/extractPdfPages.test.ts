import { describe, expect, it } from "vitest";
import { countPdfPages } from "./countPdfPages";
import { extractPdfPages } from "./extractPdfPages";
import { loadPdfFixture } from "../../test-fixtures/load";

describe("extractPdfPages", () => {
  it("selección no contigua [1,3,5] devuelve 3 páginas", async () => {
    const bytes = loadPdfFixture("text-multi-5p.pdf");
    const out = await extractPdfPages(bytes, [1, 3, 5]);
    expect(await countPdfPages(out)).toBe(3);
  });

  it("una sola página [2] devuelve 1", async () => {
    const bytes = loadPdfFixture("text-multi-5p.pdf");
    expect(await countPdfPages(await extractPdfPages(bytes, [2]))).toBe(1);
  });

  it("array vacío lanza error", async () => {
    const bytes = loadPdfFixture("text-multi-5p.pdf");
    await expect(extractPdfPages(bytes, [])).rejects.toThrow();
  });

  it("página fuera de rango lanza error", async () => {
    const bytes = loadPdfFixture("text-multi-5p.pdf");
    await expect(extractPdfPages(bytes, [1, 99])).rejects.toThrow();
  });
});
