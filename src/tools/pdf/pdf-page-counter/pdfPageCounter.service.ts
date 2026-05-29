// Adaptador delgado sobre @modulaq/core/pdf.
// Preserva la API histórica (countPdfPages devuelve { fileName, fileSize, pageCount }).
import { countPdfPages as coreCountPdfPages } from "@modulaq/core/pdf";
import { formatFileSize, isPdfFile } from "../../../shared/utils/file";
import type { PdfPageCountResult } from "./pdfPageCounter.types";

export { formatFileSize, isPdfFile };

export async function countPdfPages(file: File): Promise<PdfPageCountResult> {
  if (!isPdfFile(file)) {
    throw new Error("El archivo seleccionado no parece ser un PDF.");
  }

  try {
    const pageCount = await coreCountPdfPages(file);
    return {
      fileName: file.name,
      fileSize: file.size,
      pageCount,
    };
  } catch {
    throw new Error("No se pudo leer el PDF. Puede estar corrupto, protegido o incompleto.");
  }
}
