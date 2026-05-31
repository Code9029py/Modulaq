import { PDFDocument } from "pdf-lib";
import { loadPdfDocument } from "./shared";
import type { PdfInput } from "./types";

/**
 * Reordena las páginas de un PDF según el array `order` (1-based).
 * Permite también extraer un subconjunto en un orden arbitrario.
 *
 * El consumidor es responsable de validar que `order` tenga sentido para
 * el documento (la API no exige cubrir todas las páginas).
 */
export async function reorderPdfPages(input: PdfInput, order: number[]): Promise<Uint8Array> {
  if (order.length === 0) {
    throw new Error("reorderPdfPages requires a non-empty order array.");
  }

  const source = await loadPdfDocument(input);
  const result = await PDFDocument.create();
  const pages = await result.copyPages(
    source,
    order.map((pageNumber) => pageNumber - 1),
  );
  pages.forEach((page) => result.addPage(page));

  return result.save();
}
