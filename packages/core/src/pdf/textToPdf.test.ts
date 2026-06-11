import { describe, expect, it } from "vitest";
import { countPdfPages } from "./countPdfPages";
import {
  TEXT_TO_PDF_FONT_SIZE_MAX,
  TEXT_TO_PDF_FONT_SIZE_MIN,
  textToPdf,
} from "./textToPdf";

const PDF_HEADER = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // "%PDF"

function startsWithPdfHeader(bytes: Uint8Array): boolean {
  return bytes.slice(0, 4).every((byte, index) => byte === PDF_HEADER[index]);
}

describe("textToPdf", () => {
  it("genera bytes PDF válidos a partir de texto plano", async () => {
    const bytes = await textToPdf("Hola Modulaq");
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(0);
    expect(startsWithPdfHeader(bytes)).toBe(true);
    expect(await countPdfPages(bytes)).toBe(1);
  });

  it("rechaza texto vacío", async () => {
    await expect(textToPdf("")).rejects.toThrow();
    await expect(textToPdf("   \n\t  ")).rejects.toThrow();
  });

  it("default fontSize es 11 (acepta sin especificarlo)", async () => {
    const bytes = await textToPdf("Cuerpo");
    expect(await countPdfPages(bytes)).toBe(1);
  });

  it(`rechaza fontSize menor a ${TEXT_TO_PDF_FONT_SIZE_MIN}`, async () => {
    await expect(textToPdf("Cuerpo", { fontSize: TEXT_TO_PDF_FONT_SIZE_MIN - 1 })).rejects.toThrow();
  });

  it(`rechaza fontSize mayor a ${TEXT_TO_PDF_FONT_SIZE_MAX}`, async () => {
    await expect(textToPdf("Cuerpo", { fontSize: TEXT_TO_PDF_FONT_SIZE_MAX + 1 })).rejects.toThrow();
  });

  it("rechaza fontSize no entero", async () => {
    await expect(textToPdf("Cuerpo", { fontSize: 11.5 })).rejects.toThrow();
  });

  it("hace word-wrap y pagina texto largo en varias páginas", async () => {
    const longText = Array.from({ length: 200 }, (_, i) => `Línea de prueba número ${i + 1}.`).join("\n");
    const bytes = await textToPdf(longText, { pageSize: "a4", fontSize: 12, margin: 56 });
    const pageCount = await countPdfPages(bytes);
    expect(pageCount).toBeGreaterThanOrEqual(2);
  });

  it("aplica title cuando se pasa", async () => {
    const bytes = await textToPdf("Cuerpo", { title: "Mi documento de prueba" });
    expect(await countPdfPages(bytes)).toBe(1);
  });

  it("acepta los 3 tamaños de página: a4, letter, legal", async () => {
    for (const pageSize of ["a4", "letter", "legal"] as const) {
      const bytes = await textToPdf("Hello", { pageSize });
      expect(await countPdfPages(bytes)).toBe(1);
    }
  });

  it("acepta las 3 fuentes estándar: helvetica, times-roman, courier", async () => {
    for (const fontFamily of ["helvetica", "times-roman", "courier"] as const) {
      const bytes = await textToPdf("Hello", { fontFamily });
      expect(await countPdfPages(bytes)).toBe(1);
    }
  });
});
