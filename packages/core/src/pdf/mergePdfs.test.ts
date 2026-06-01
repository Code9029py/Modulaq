import { describe, expect, it } from "vitest";
import { countPdfPages } from "./countPdfPages";
import { mergePdfs } from "./mergePdfs";
import { loadPdfFixture } from "../../test-fixtures/load";

describe("mergePdfs", () => {
  it("merge de 1p + 3p produce un PDF de 4 páginas", async () => {
    const a = loadPdfFixture("text-simple-1p.pdf");
    const b = loadPdfFixture("text-multi-3p.pdf");
    const merged = await mergePdfs([a, b]);
    expect(merged).toBeInstanceOf(Uint8Array);
    expect(merged.length).toBeGreaterThan(0);
    expect(await countPdfPages(merged)).toBe(4);
  });

  it("merge de 3p + 5p produce un PDF de 8 páginas", async () => {
    const a = loadPdfFixture("text-multi-3p.pdf");
    const b = loadPdfFixture("text-multi-5p.pdf");
    expect(await countPdfPages(await mergePdfs([a, b]))).toBe(8);
  });

  it("lista vacía lanza error", async () => {
    await expect(mergePdfs([])).rejects.toThrow();
  });
});
