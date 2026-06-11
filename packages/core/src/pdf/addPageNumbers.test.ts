import { describe, expect, it } from "vitest";
import {
  ADD_PAGE_NUMBERS_STARTING_NUMBER_MAX,
  addPageNumbers,
  formatPageNumberLabel,
} from "./addPageNumbers";
import { countPdfPages } from "./countPdfPages";
import { loadPdfFixture } from "../../test-fixtures/load";

describe("formatPageNumberLabel", () => {
  it("renderiza solo número", () => {
    expect(formatPageNumberLabel("{n}", 3, 10)).toBe("3");
  });

  it("renderiza n / total", () => {
    expect(formatPageNumberLabel("{n} / {total}", 3, 10)).toBe("3 / 10");
  });

  it("renderiza formato 'Página n de total'", () => {
    expect(formatPageNumberLabel("Página {n} de {total}", 1, 5)).toBe("Página 1 de 5");
  });

  it("renderiza formato 'Page n of total'", () => {
    expect(formatPageNumberLabel("Page {n} of {total}", 2, 8)).toBe("Page 2 of 8");
  });
});

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

  it("PDF de 3 páginas con startPage=2, startingNumber=1 conserva 3 páginas", async () => {
    const source = loadPdfFixture("text-multi-3p.pdf");
    const result = await addPageNumbers(source, { startPage: 2, startingNumber: 1 });
    expect(await countPdfPages(result)).toBe(3);
  });

  it("startPage fuera de rango rechaza", async () => {
    const source = loadPdfFixture("text-multi-3p.pdf");
    await expect(addPageNumbers(source, { startPage: 4 })).rejects.toThrow();
  });

  it("startPage < 1 rechaza", async () => {
    const source = loadPdfFixture("text-multi-3p.pdf");
    await expect(addPageNumbers(source, { startPage: 0 })).rejects.toThrow();
  });

  it("startingNumber < 1 rechaza", async () => {
    const source = loadPdfFixture("text-multi-3p.pdf");
    await expect(addPageNumbers(source, { startingNumber: 0 })).rejects.toThrow();
  });

  it(`startingNumber > ${ADD_PAGE_NUMBERS_STARTING_NUMBER_MAX} rechaza`, async () => {
    const source = loadPdfFixture("text-multi-3p.pdf");
    await expect(
      addPageNumbers(source, { startingNumber: ADD_PAGE_NUMBERS_STARTING_NUMBER_MAX + 1 }),
    ).rejects.toThrow();
  });
});
