import { PDFDocument } from "pdf-lib";
import { normalizeBytes } from "../shared/normalizeBytes";
import type { PdfInput } from "./types";

/**
 * Cuenta las páginas de un PDF.
 * Acepta `File` / `Blob` / `ArrayBuffer` / `Uint8Array`.
 *
 * Lanza `Error` si el PDF está dañado, protegido o tiene un formato incompatible.
 */
export async function countPdfPages(input: PdfInput): Promise<number> {
  const bytes = await normalizeBytes(input);
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return pdf.getPageCount();
}
