// Adaptador delgado sobre @modulaq/core/pdf.
// Preserva la API histórica del service (mergePdfFiles, readPdfMetadata, sanitizePdfFileName,
// formatFileSize, isPdfFile, getBaseFileName, defaultOutputFileName).
import { countPdfPages as coreCountPdfPages, mergePdfs as coreMergePdfs } from "@modulaq/core/pdf";
import { ToolError } from "../../../shared/errors/ToolError";
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
    throw new ToolError("tools.errors.invalidPdfNamed", { name: file.name });
  }

  try {
    const pageCount = await coreCountPdfPages(file);
    return { fileName: file.name, fileSize: file.size, pageCount };
  } catch {
    throw new ToolError("tools.errors.unreadablePdfNamed", { name: file.name });
  }
}

export async function mergePdfFiles(files: File[], options: MergePdfOptions = {}): Promise<MergePdfResult> {
  if (files.length < 2) {
    throw new ToolError("tools.errors.pdfMergeNeedTwo");
  }

  for (const file of files) {
    if (!isPdfFile(file)) {
      throw new ToolError("tools.errors.invalidPdfNamed", { name: file.name });
    }
  }

  let bytes: Uint8Array;
  try {
    bytes = await coreMergePdfs(files);
  } catch {
    throw new ToolError("tools.errors.pdfMergeFailed");
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
