// Adaptador delgado sobre @modulaq/core/pdf.removePdfPages.
// Reusa parsePageSelection (@modulaq/core/ranges) para validar la entrada.
import { countPdfPages as coreCountPdfPages, removePdfPages as coreRemovePdfPages } from "@modulaq/core/pdf";
import { parsePageSelection } from "@modulaq/core/ranges";
import { ToolError } from "../../../shared/errors/ToolError";
import { buildDownloadFileName, getSuggestedDownloadBaseName } from "../../../shared/utils/downloadFileName";
import { formatFileSize, isPdfFile, toArrayBuffer } from "../../../shared/utils/file";
import type { RemovePdfPagesMetadata, RemovePdfPagesResult } from "./removePdfPages.types";

export { formatFileSize, isPdfFile };

export const defaultOutputBaseName = "pdf-sin-paginas";

export function getSuggestedOutputBaseName(fileName: string) {
  return getSuggestedDownloadBaseName(fileName, defaultOutputBaseName);
}

export function getOutputFileName(outputBaseName: string, fallbackBaseName = defaultOutputBaseName) {
  return buildDownloadFileName(outputBaseName, "pdf", fallbackBaseName);
}

async function readPageCount(file: File): Promise<number> {
  try {
    return await coreCountPdfPages(file);
  } catch {
    throw new ToolError("tools.errors.unreadablePdf");
  }
}

export async function readPdfMetadata(file: File): Promise<RemovePdfPagesMetadata> {
  if (!isPdfFile(file)) {
    throw new ToolError("tools.errors.invalidPdf");
  }
  const pageCount = await readPageCount(file);
  return { fileName: file.name, fileSize: file.size, pageCount };
}

/**
 * Valida la selección a remover contra el total. Devuelve el array de páginas
 * a eliminar o lanza ToolError con código i18n.
 */
export function resolvePagesToRemove(rangeInput: string, totalPages: number): number[] {
  const parsed = parsePageSelection(rangeInput, totalPages);
  if (parsed.error) {
    throw new ToolError(parsed.error.code, parsed.error.vars);
  }
  if (parsed.pages.length === 0) {
    throw new ToolError("tools.errors.pageRangeEmpty");
  }
  if (parsed.pages.length >= totalPages) {
    throw new ToolError("tools.errors.removeAllPages");
  }
  return parsed.pages;
}

export async function removePdfPagesFromFile(
  file: File,
  rangeInput: string,
  outputBaseName: string,
): Promise<RemovePdfPagesResult> {
  if (!isPdfFile(file)) {
    throw new ToolError("tools.errors.invalidPdf");
  }

  const totalPages = await readPageCount(file);
  const pagesToRemove = resolvePagesToRemove(rangeInput, totalPages);

  let bytes: Uint8Array;
  try {
    bytes = await coreRemovePdfPages(file, pagesToRemove);
  } catch {
    throw new ToolError("tools.errors.removePdfPagesFailed");
  }

  return {
    bytes: toArrayBuffer(bytes),
    fileName: getOutputFileName(outputBaseName, getSuggestedOutputBaseName(file.name)),
    removedCount: pagesToRemove.length,
    remainingCount: totalPages - pagesToRemove.length,
  };
}
