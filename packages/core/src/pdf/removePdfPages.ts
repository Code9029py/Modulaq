import { PDFDocument } from "pdf-lib";
import { loadPdfDocument } from "./shared";
import type { PdfInput } from "./types";

/**
 * Elimina las páginas indicadas (1-based) de un PDF y devuelve un nuevo PDF
 * con el resto, conservando el orden original. Implementado como complemento
 * de `extractPdfPages`: copia las páginas que NO están en `pagesToRemove`.
 *
 * Reglas:
 *  - `pagesToRemove` se trata como Set: duplicados se ignoran.
 *  - Si después de remover no queda ninguna página, lanza error: un PDF vacío
 *    no es útil y la herramienta nunca debería permitirlo.
 *  - Páginas fuera de rango se ignoran silenciosamente; validar en el caller.
 */
export async function removePdfPages(input: PdfInput, pagesToRemove: number[]): Promise<Uint8Array> {
  const source = await loadPdfDocument(input);
  const totalPages = source.getPageCount();

  const removeSet = new Set(pagesToRemove);
  const keepIndices: number[] = [];
  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    if (!removeSet.has(pageNumber)) {
      keepIndices.push(pageNumber - 1);
    }
  }

  if (keepIndices.length === 0) {
    throw new Error("removePdfPages would leave the document with no pages.");
  }

  const result = await PDFDocument.create();
  const pages = await result.copyPages(source, keepIndices);
  pages.forEach((page) => result.addPage(page));
  return result.save();
}
