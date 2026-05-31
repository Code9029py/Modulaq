import { PDFDocument } from "pdf-lib";
import { loadPdfDocument } from "./shared";
import type { PdfInput } from "./types";

/**
 * Une varios PDFs en uno, respetando el orden del array.
 * Devuelve los bytes del PDF combinado.
 *
 * Lanza si el array está vacío o si alguna entrada no puede cargarse.
 */
export async function mergePdfs(inputs: PdfInput[]): Promise<Uint8Array> {
  if (inputs.length === 0) {
    throw new Error("mergePdfs requires at least one input.");
  }

  const merged = await PDFDocument.create();
  for (const input of inputs) {
    const source = await loadPdfDocument(input);
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  return merged.save();
}
