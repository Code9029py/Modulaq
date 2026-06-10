import { describe, expect, it } from "vitest";
import { countPdfPages } from "./countPdfPages";
import { textToPdf } from "./textToPdf";

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

  it("hace word-wrap y pagina texto largo en varias páginas", async () => {
    // Texto largo: muchas líneas para forzar paginación.
    const longText = Array.from({ length: 200 }, (_, i) => `Línea de prueba número ${i + 1}.`).join("\n");
    const bytes = await textToPdf(longText, { pageSize: "a4", fontSize: 12, margin: 56 });
    const pageCount = await countPdfPages(bytes);
    expect(pageCount).toBeGreaterThanOrEqual(2);
  });

  it("aplica title cuando se pasa", async () => {
    // Título largo + texto corto: una página, sin reventar.
    const bytes = await textToPdf("Cuerpo", { title: "Mi documento de prueba" });
    expect(await countPdfPages(bytes)).toBe(1);
  });

  it("permite seleccionar letter como page size", async () => {
    const bytes = await textToPdf("Hello world", { pageSize: "letter" });
    expect(await countPdfPages(bytes)).toBe(1);
  });
});
