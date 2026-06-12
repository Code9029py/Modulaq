import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { countPdfPages } from "./countPdfPages";
import { rotatePdfPages, type PdfRotation } from "./rotatePdfPages";
import { garbageBytes, loadPdfFixture } from "../../test-fixtures/load";

async function getPageAngles(bytes: Uint8Array): Promise<number[]> {
  const document = await PDFDocument.load(bytes);
  return document.getPages().map((page) => page.getRotation().angle);
}

describe("rotatePdfPages", () => {
  it("rota 90 grados todas las páginas de un PDF multipágina", async () => {
    const source = loadPdfFixture("text-multi-3p.pdf");
    const result = await rotatePdfPages(source, 90);
    expect(await countPdfPages(result)).toBe(3);
    expect(await getPageAngles(result)).toEqual([90, 90, 90]);
  });

  it("rota 180 grados un PDF de una página", async () => {
    const source = loadPdfFixture("text-simple-1p.pdf");
    const result = await rotatePdfPages(source, 180);
    expect(await getPageAngles(result)).toEqual([180]);
  });

  it("rota 270 grados un PDF de una página", async () => {
    const source = loadPdfFixture("text-simple-1p.pdf");
    const result = await rotatePdfPages(source, 270);
    expect(await getPageAngles(result)).toEqual([270]);
  });

  it("acumula la rotación sobre páginas ya rotadas (módulo 360)", async () => {
    const source = loadPdfFixture("text-simple-1p.pdf");
    const once = await rotatePdfPages(source, 270);
    const twice = await rotatePdfPages(once, 180);
    expect(await getPageAngles(twice)).toEqual([90]);
  });

  it("lanza error con una rotación no soportada", async () => {
    const source = loadPdfFixture("text-simple-1p.pdf");
    await expect(rotatePdfPages(source, 45 as PdfRotation)).rejects.toThrow();
  });

  it("lanza error con bytes que no son un PDF", async () => {
    await expect(rotatePdfPages(garbageBytes(), 90)).rejects.toThrow();
  });
});
