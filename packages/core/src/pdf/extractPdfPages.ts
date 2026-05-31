import { PDFDocument } from "pdf-lib";
import { loadPdfDocument } from "./shared";
import type { PdfInput } from "./types";

/**
 * Extrae un subconjunto arbitrario de páginas (1-based) a un PDF nuevo.
 * El orden del array determina el orden final.
 *
 * Es el primitivo sobre el que se construyen `splitPdfRange` y los modos
 * "varias partes" / "todas las páginas individuales" del consumidor.
 */
export async function extractPdfPages(input: PdfInput, pageNumbers: number[]): Promise<Uint8Array> {
  if (pageNumbers.length === 0) {
    throw new Error("extractPdfPages requires at least one page number.");
  }

  const source = await loadPdfDocument(input);
  const result = await PDFDocument.create();
  const pages = await result.copyPages(
    source,
    pageNumbers.map((pageNumber) => pageNumber - 1),
  );
  pages.forEach((page) => result.addPage(page));

  return result.save();
}
