// Adaptador delgado sobre @modulaq/core/pdf.
// Preserva la API histórica del service (mergePdfFiles, readPdfMetadata, sanitizePdfFileName,
// formatFileSize, isPdfFile, getBaseFileName, defaultOutputFileName).
import { countPdfPages as coreCountPdfPages, mergePdfs as coreMergePdfs } from "@modulaq/core/pdf";
import { buildDownloadFileName, getBaseFileName } from "../../../shared/utils/downloadFileName";
import { formatFileSize, isPdfFile, toArrayBuffer } from "../../../shared/utils/file";
import type { MergePdfFileMetadata, MergePdfOptions, MergePdfResult } from "./mergePdf.types";

export { formatFileSize, isPdfFile, getBaseFileName };

export const defaultOutputFileName = "pdfs-unidos";

export function sanitizePdfFileName(fileName: string) {
  return buildDownloadFileName(fileName, "pdf", defaultOutputFileName);
}

export async function readPdfMetadata(file: File): Promise<MergePdfFileMetadata> {
  if (!isPdfFile(file)) {
    throw new Error(`"${file.name}" no es un archivo PDF válido.`);
  }

  try {
    const pageCount = await coreCountPdfPages(file);
    return { fileName: file.name, fileSize: file.size, pageCount };
  } catch {
    throw new Error(`No se pudo leer "${file.name}". Puede estar dañado, protegido o incompleto.`);
  }
}

export async function mergePdfFiles(files: File[], options: MergePdfOptions = {}): Promise<MergePdfResult> {
  if (files.length < 2) {
    throw new Error("Agregá al menos dos PDFs para unirlos.");
  }

  for (const file of files) {
    if (!isPdfFile(file)) {
      throw new Error(`"${file.name}" no es un archivo PDF válido.`);
    }
  }

  let bytes: Uint8Array;
  try {
    bytes = await coreMergePdfs(files);
  } catch {
    throw new Error("No se pudo generar el PDF final. Probá quitar el archivo problemático e intentá de nuevo.");
  }

  // Recalculamos el pageCount sobre el resultado para reflejar la realidad
  // (incluye páginas copiadas con éxito de cada origen).
  const pageCount = await coreCountPdfPages(bytes);

  return {
    bytes: toArrayBuffer(bytes),
    fileName: sanitizePdfFileName(options.outputFileName ?? defaultOutputFileName),
    pageCount,
  };
}
