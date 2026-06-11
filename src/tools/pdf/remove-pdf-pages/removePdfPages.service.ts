// Adaptador delgado sobre @modulaq/core/pdf.removePdfPages.
// Reusa parsePageSelection (@modulaq/core/ranges) para validar la entrada.
import { countPdfPages as coreCountPdfPages, removePdfPages as coreRemovePdfPages } from "@modulaq/core/pdf";
import { parsePageSelection } from "@modulaq/core/ranges";
import { ToolError } from "../../../shared/errors/ToolError";
import type { Language } from "../../../shared/i18n/types";
import { buildDownloadFileName, getSuggestedDownloadBaseName } from "../../../shared/utils/downloadFileName";
import { formatFileSize, isPdfFile, toArrayBuffer } from "../../../shared/utils/file";
import type { RemovePdfPagesMetadata, RemovePdfPagesResult } from "./removePdfPages.types";

export { formatFileSize, isPdfFile };

export const defaultOutputBaseName = "pdf-sin-paginas";
const defaultOutputBaseNames: Record<Language, string> = {
  es: defaultOutputBaseName,
  en: "pdf-pages-removed",
};

export function getDefaultOutputBaseName(language: Language): string {
  return defaultOutputBaseNames[language];
}

export function getSuggestedOutputBaseName(fileName: string, fallbackBaseName = defaultOutputBaseName) {
  return getSuggestedDownloadBaseName(fileName, fallbackBaseName);
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

export type RemovePdfPagesValidation =
  | { state: "empty" }
  | { state: "ok"; pages: number[] }
  | { state: "error"; code: string; vars?: Record<string, string | number> };

/**
 * Variante non-throwing para validación en vivo desde la UI. No tira: devuelve
 * estado discriminado para que la UI muestre el feedback sin try/catch.
 *
 *  - `empty`: input vacío (no es error agresivo).
 *  - `ok`: parse correcto + reglas funcionales cumplidas; trae las páginas.
 *  - `error`: code i18n + vars para localizar el mensaje.
 */
export function validateRangeInput(rangeInput: string, totalPages: number): RemovePdfPagesValidation {
  if (rangeInput.trim().length === 0) {
    return { state: "empty" };
  }
  const parsed = parsePageSelection(rangeInput, totalPages);
  if (parsed.error) {
    return { state: "error", code: parsed.error.code, vars: parsed.error.vars };
  }
  if (parsed.pages.length === 0) {
    return { state: "error", code: "tools.errors.pageRangeEmpty" };
  }
  if (parsed.pages.length >= totalPages) {
    return { state: "error", code: "tools.errors.removeAllPages" };
  }
  return { state: "ok", pages: parsed.pages };
}

export async function removePdfPagesFromFile(
  file: File,
  rangeInput: string,
  outputBaseName: string,
  fallbackBaseName: string = defaultOutputBaseName,
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
    fileName: getOutputFileName(outputBaseName, getSuggestedOutputBaseName(file.name, fallbackBaseName)),
    removedCount: pagesToRemove.length,
    remainingCount: totalPages - pagesToRemove.length,
  };
}
