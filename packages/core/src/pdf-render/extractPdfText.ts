import { ensureWorkerConfigured, loadPdfJsDocument } from "./shared";
import type { ExtractedPdfText, PdfInput } from "./types";

type TextItemLike = { str?: unknown };

/**
 * Junta los `str` de los items textuales de una página, separados por espacio.
 * Colapsa whitespace múltiple y recorta extremos.
 */
function joinPageItems(items: readonly unknown[]): string {
  const parts: string[] = [];
  for (const item of items) {
    if (item && typeof item === "object" && "str" in item) {
      const value = (item as TextItemLike).str;
      if (typeof value === "string" && value.length > 0) {
        parts.push(value);
      }
    }
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Extracción simple de texto seleccionable de un PDF.
 *
 * - Devuelve un array con el texto de cada página (en orden) y la unión
 *   de todas las páginas separadas por una línea en blanco.
 * - **No hace OCR**: los PDFs escaneados (imágenes) pueden devolver páginas vacías.
 * - **No reconstruye layout**: el orden de lectura y los saltos de línea son
 *   aproximados; columnas, tablas y estructuras complejas pueden quedar
 *   "aplanadas".
 *
 * Requiere que `configurePdfWorker(...)` haya sido llamado previamente; de lo
 * contrario lanza un `Error` claro.
 */
export async function extractPdfText(input: PdfInput): Promise<ExtractedPdfText> {
  ensureWorkerConfigured();

  const pdf = await loadPdfJsDocument(input);
  const pages: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(joinPageItems(content.items));
    }
  } finally {
    await pdf.destroy();
  }

  return { pages, text: pages.join("\n\n") };
}
