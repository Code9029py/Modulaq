import { extractPdfPages } from "./extractPdfPages";
import type { PdfInput } from "./types";

export type PageRange = { from: number; to: number };

/**
 * Atajo sobre `extractPdfPages` para extraer un rango contiguo inclusivo
 * `[from, to]` (ambos 1-based).
 */
export async function splitPdfRange(input: PdfInput, range: PageRange): Promise<Uint8Array> {
  if (!Number.isInteger(range.from) || !Number.isInteger(range.to) || range.from < 1 || range.to < range.from) {
    throw new Error(`Invalid range ${range.from}-${range.to}.`);
  }

  const pageNumbers: number[] = [];
  for (let pageNumber = range.from; pageNumber <= range.to; pageNumber += 1) {
    pageNumbers.push(pageNumber);
  }

  return extractPdfPages(input, pageNumbers);
}
