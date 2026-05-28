import { PDFDocument } from "pdf-lib";
import { formatFileSize, isPdfFile } from "../../../shared/utils/file";
import type { PdfPageCountResult } from "./pdfPageCounter.types";

export { formatFileSize, isPdfFile };

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
