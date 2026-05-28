import { PDFDocument } from "pdf-lib";
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

async function loadPdfDocument(file: File) {
  if (!isPdfFile(file)) {
    throw new Error("Seleccioná un archivo PDF válido.");
  }

  try {
    return await PDFDocument.load(await file.arrayBuffer(), {
      ignoreEncryption: true,
    });
  } catch {
    throw new Error("No se pudo leer el PDF. Puede estar dañado, protegido o incompleto.");
  }
}

export async function readPdfMetadata(file: File): Promise<ReorderPdfPagesMetadata> {
  const pdfDocument = await loadPdfDocument(file);

  return {
    fileName: file.name,
    fileSize: file.size,
    pageCount: pdfDocument.getPageCount(),
  };
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
  const sourceDocument = await loadPdfDocument(file);
  const pageCount = sourceDocument.getPageCount();
  validatePageOrder(pageOrder, pageCount);

  try {
    const resultDocument = await PDFDocument.create();
    const pages = await resultDocument.copyPages(
      sourceDocument,
      pageOrder.map((pageNumber) => pageNumber - 1),
    );

    pages.forEach((page) => resultDocument.addPage(page));

    return {
      bytes: toArrayBuffer(await resultDocument.save()),
      fileName: getOutputFileName(outputBaseName, getSuggestedOutputBaseName(file.name)),
      pageCount,
    };
  } catch {
    throw new Error("No se pudo crear el PDF reordenado. Probá nuevamente con otro archivo.");
  }
}
