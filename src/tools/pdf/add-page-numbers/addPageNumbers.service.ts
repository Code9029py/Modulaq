// Adaptador delgado sobre @modulaq/core/pdf.addPageNumbers.
// El mapeo de presets de formato a templates con {n}/{total} vive acá porque
// depende del idioma activo del consumidor.
import {
  ADD_PAGE_NUMBERS_STARTING_NUMBER_MAX,
  addPageNumbers as coreAddPageNumbers,
  countPdfPages as coreCountPdfPages,
  formatPageNumberLabel,
} from "@modulaq/core/pdf";
import { ToolError } from "../../../shared/errors/ToolError";
import type { Language } from "../../../shared/i18n/types";
import { buildDownloadFileName, getSuggestedDownloadBaseName } from "../../../shared/utils/downloadFileName";
import { formatFileSize, isPdfFile, toArrayBuffer } from "../../../shared/utils/file";
import type {
  AddPageNumbersFormOptions,
  AddPageNumbersMetadata,
  AddPageNumbersResult,
  PageNumberFormatPreset,
} from "./addPageNumbers.types";

export { formatFileSize, isPdfFile };

export const defaultOutputBaseName = "pdf-numerado";

export const STARTING_NUMBER_MAX = ADD_PAGE_NUMBERS_STARTING_NUMBER_MAX;

/** Templates por preset/idioma. {n} = número visible, {total} = numerated total. */
const FORMAT_TEMPLATES: Record<PageNumberFormatPreset, Record<Language, string>> = {
  n: { es: "{n}", en: "{n}" },
  "n-of-total": { es: "{n} / {total}", en: "{n} / {total}" },
  "page-n": { es: "Página {n}", en: "Page {n}" },
  "page-n-of-total": { es: "Página {n} de {total}", en: "Page {n} of {total}" },
  "pag-n": { es: "Pág. {n}", en: "p. {n}" },
  "pag-n-of-total": { es: "Pág. {n} de {total}", en: "p. {n} of {total}" },
};

export function getFormatTemplate(format: PageNumberFormatPreset, language: Language): string {
  return FORMAT_TEMPLATES[format][language];
}

/** Vista previa local del label sin abrir el PDF. */
export function previewPageNumberLabel(
  format: PageNumberFormatPreset,
  language: Language,
  visibleNumber: number,
  total: number,
): string {
  return formatPageNumberLabel(getFormatTemplate(format, language), visibleNumber, total);
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
    throw new ToolError("tools.errors.unreadablePdf");
  }
}

export async function readPdfMetadata(file: File): Promise<AddPageNumbersMetadata> {
  if (!isPdfFile(file)) {
    throw new ToolError("tools.errors.invalidPdf");
  }
  const pageCount = await readPageCount(file);
  return { fileName: file.name, fileSize: file.size, pageCount };
}

function isPositiveInteger(value: number): boolean {
  return Number.isFinite(value) && Number.isInteger(value) && value >= 1;
}

/** Devuelve `null` o el code i18n del primer error encontrado. */
export function validateAddPageNumbersOptions(
  options: AddPageNumbersFormOptions,
  totalPages: number,
): { code: string; vars?: Record<string, string | number> } | null {
  if (!isPositiveInteger(options.startPage)) {
    return { code: "tools.errors.startPageInvalid" };
  }
  if (options.startPage > totalPages) {
    return { code: "tools.errors.startPageOutOfRange", vars: { total: totalPages } };
  }
  if (!isPositiveInteger(options.startingNumber)) {
    return { code: "tools.errors.startingNumberInvalid" };
  }
  if (options.startingNumber > STARTING_NUMBER_MAX) {
    return { code: "tools.errors.startingNumberOutOfRange", vars: { max: STARTING_NUMBER_MAX } };
  }
  return null;
}

export async function addPageNumbersToFile(
  file: File,
  options: AddPageNumbersFormOptions,
  outputBaseName: string,
  language: Language,
): Promise<AddPageNumbersResult> {
  if (!isPdfFile(file)) {
    throw new ToolError("tools.errors.invalidPdf");
  }

  const totalPages = await readPageCount(file);
  const validationError = validateAddPageNumbersOptions(options, totalPages);
  if (validationError) {
    throw new ToolError(validationError.code, validationError.vars);
  }

  let bytes: Uint8Array;
  try {
    bytes = await coreAddPageNumbers(file, {
      position: options.position,
      template: getFormatTemplate(options.format, language),
      startPage: options.startPage,
      startingNumber: options.startingNumber,
    });
  } catch {
    throw new ToolError("tools.errors.addPageNumbersFailed");
  }

  const pageCount = await coreCountPdfPages(bytes);
  const numberedPages = totalPages - options.startPage + 1;

  return {
    bytes: toArrayBuffer(bytes),
    fileName: getOutputFileName(outputBaseName, getSuggestedOutputBaseName(file.name)),
    pageCount,
    numberedPages,
  };
}
