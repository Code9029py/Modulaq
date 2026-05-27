import { PDFDocument } from "pdf-lib";
import type { PdfPageCountResult } from "./pdfPageCounter.types";

export function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  return `${(kilobytes / 1024).toFixed(2)} MB`;
}

export async function countPdfPages(file: File): Promise<PdfPageCountResult> {
  if (!isPdfFile(file)) {
    throw new Error("El archivo seleccionado no parece ser un PDF.");
  }

  try {
    const fileBuffer = await file.arrayBuffer();
    const pdfDocument = await PDFDocument.load(fileBuffer, {
      ignoreEncryption: true,
    });

    return {
      fileName: file.name,
      fileSize: file.size,
      pageCount: pdfDocument.getPageCount(),
    };
  } catch {
    throw new Error("No se pudo leer el PDF. Puede estar corrupto, protegido o incompleto.");
  }
}
