import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { normalizeBytes } from "../shared/normalizeBytes";
import type { PdfInput } from "./types";

const WORKER_NOT_CONFIGURED =
  "El worker de pdfjs-dist no está configurado. Llamá a configurePdfWorker(...) antes de usar @modulaq/core/pdf-render.";

/**
 * Verifica que el consumidor haya configurado el worker. Si no, lanza un
 * error explícito con el nombre del helper a usar. Las funciones públicas del
 * subpath /pdf-render deben llamarla al principio.
 */
export function ensureWorkerConfigured(): void {
  const opts = pdfjsLib.GlobalWorkerOptions;
  if (!opts.workerSrc && !opts.workerPort) {
    throw new Error(WORKER_NOT_CONFIGURED);
  }
}

/**
 * Helper interno: convierte `PdfInput` a bytes y abre el documento con pdfjs-dist.
 * NO valida el worker; eso es responsabilidad del caller público.
 */
export async function loadPdfJsDocument(input: PdfInput): Promise<PDFDocumentProxy> {
  const bytes = await normalizeBytes(input);
  const loadingTask = pdfjsLib.getDocument({ data: bytes });
  return loadingTask.promise;
}
