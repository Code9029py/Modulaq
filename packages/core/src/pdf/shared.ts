import { PDFDocument } from "pdf-lib";
import { normalizeBytes } from "../shared/normalizeBytes";
import type { PdfInput } from "./types";

const PDF_LOAD_OPTIONS = { ignoreEncryption: true } as const;

/**
 * Helper interno: convierte cualquier `PdfInput` a `Uint8Array` y lo carga
 * con pdf-lib. `ignoreEncryption: true` permite leer PDFs con encriptación
 * básica de solo lectura.
 */
export async function loadPdfDocument(input: PdfInput): Promise<PDFDocument> {
  const bytes = await normalizeBytes(input);
  return PDFDocument.load(bytes, PDF_LOAD_OPTIONS);
}
