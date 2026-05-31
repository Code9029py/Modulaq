// Adaptador delgado sobre @modulaq/core/pdf.
// Preserva la API histórica del service de Reordenar páginas PDF.
import {
  countPdfPages as coreCountPdfPages,
  reorderPdfPages as coreReorderPdfPages,
} from "@modulaq/core/pdf";
import { buildDownloadFileName, getSuggestedDownloadBaseName } from "../../../shared/utils/downloadFileName";
import { formatFileSize, isPdfFile, toArrayBuffer } from "../../../shared/utils/file";
import type { ReorderPdfPagesMetadata, ReorderPdfPagesResult } from "./reorderPdfPages.types";

export { formatFileSize, isPdfFile };

export const defaultOutputBaseName = "pdf-reordenado";

export function createOriginalPageOrder(pageCount: number) {
  return Array.from({ length: pageCount }, (_, index) => index + 1);
}

export function isOriginalPageOrder(pageOrder: number[]) {
  return pageOrder.every((pageNumber, index) => pageNumber === index + 1);
}

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
    throw new Error("No se pudo leer el PDF. Puede estar dañado, protegido o incompleto.");
  }
}

export async function readPdfMetadata(file: File): Promise<ReorderPdfPagesMetadata> {
  if (!isPdfFile(file)) {
    throw new Error("Seleccioná un archivo PDF válido.");
  }

  const pageCount = await readPageCount(file);
  return { fileName: file.name, fileSize: file.size, pageCount };
}

function validatePageOrder(pageOrder: number[], pageCount: number) {
  if (pageOrder.length !== pageCount) {
    throw new Error("No se pudo procesar el orden de páginas. Restablecé el orden e intentá nuevamente.");
  }

  const uniquePages = new Set(pageOrder);
  const hasInvalidPage = pageOrder.some((pageNumber) => pageNumber < 1 || pageNumber > pageCount);

  if (uniquePages.size !== pageCount || hasInvalidPage) {
    throw new Error("El orden contiene páginas inválidas o repetidas. Restablecé el orden e intentá nuevamente.");
  }
}

export async function reorderPdfPages(
  file: File,
  pageOrder: number[],
  outputBaseName: string,
): Promise<ReorderPdfPagesResult> {
  if (!isPdfFile(file)) {
    throw new Error("Seleccioná un archivo PDF válido.");
  }

  const pageCount = await readPageCount(file);
  validatePageOrder(pageOrder, pageCount);

  let bytes: Uint8Array;
  try {
    bytes = await coreReorderPdfPages(file, pageOrder);
  } catch {
    throw new Error("No se pudo crear el PDF reordenado. Probá nuevamente con otro archivo.");
  }

  return {
    bytes: toArrayBuffer(bytes),
    fileName: getOutputFileName(outputBaseName, getSuggestedOutputBaseName(file.name)),
    pageCount,
  };
}
