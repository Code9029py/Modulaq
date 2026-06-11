// Adaptador delgado sobre @modulaq/core/pdf.textToPdf.
import {
  countPdfPages as coreCountPdfPages,
  TEXT_TO_PDF_FONT_SIZE_MAX,
  TEXT_TO_PDF_FONT_SIZE_MIN,
  textToPdf as coreTextToPdf,
} from "@modulaq/core/pdf";
import { ToolError } from "../../../shared/errors/ToolError";
import type { Language } from "../../../shared/i18n/types";
import { buildDownloadFileName } from "../../../shared/utils/downloadFileName";
import { toArrayBuffer } from "../../../shared/utils/file";
import type { TextToPdfFormOptions, TextToPdfResult } from "./textToPdf.types";

export const defaultOutputBaseName = "texto-a-pdf";
const defaultOutputBaseNames: Record<Language, string> = {
  es: defaultOutputBaseName,
  en: "text-to-pdf",
};

export function getDefaultOutputBaseName(language: Language): string {
  return defaultOutputBaseNames[language];
}

/** Caracteres máximos de texto. Generoso pero finito para evitar OOM. */
export const MAX_TEXT_LENGTH = 200_000;

export const FONT_SIZE_MIN = TEXT_TO_PDF_FONT_SIZE_MIN;
export const FONT_SIZE_MAX = TEXT_TO_PDF_FONT_SIZE_MAX;

export function buildOutputFileName(baseName: string, fallbackBaseName = defaultOutputBaseName): string {
  return buildDownloadFileName(baseName, "pdf", fallbackBaseName);
}

/** Devuelve `null` si el tamaño es válido o el code i18n del error. */
export function validateFontSize(value: number): string | null {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return "tools.errors.textToPdfFontSizeInvalid";
  }
  if (value < FONT_SIZE_MIN || value > FONT_SIZE_MAX) {
    return "tools.errors.textToPdfFontSizeOutOfRange";
  }
  return null;
}

export async function generateTextPdf(
  text: string,
  options: TextToPdfFormOptions,
  outputBaseName: string = defaultOutputBaseName,
  fallbackBaseName: string = defaultOutputBaseName,
): Promise<TextToPdfResult> {
  if (text.trim().length === 0) {
    throw new ToolError("tools.errors.textToPdfEmpty");
  }
  if (text.length > MAX_TEXT_LENGTH) {
    throw new ToolError("tools.errors.textToPdfTooLong", { limit: MAX_TEXT_LENGTH });
  }

  const fontSizeError = validateFontSize(options.fontSize);
  if (fontSizeError) {
    throw new ToolError(fontSizeError, { min: FONT_SIZE_MIN, max: FONT_SIZE_MAX });
  }

  let bytes: Uint8Array;
  try {
    bytes = await coreTextToPdf(text, {
      title: options.title.trim() || undefined,
      fontSize: options.fontSize,
      margin: options.margin,
      pageSize: options.pageSize,
      fontFamily: options.fontFamily,
    });
  } catch {
    throw new ToolError("tools.errors.textToPdfFailed");
  }

  const pageCount = await coreCountPdfPages(bytes);

  return {
    bytes: toArrayBuffer(bytes),
    fileName: buildOutputFileName(outputBaseName, fallbackBaseName),
    pageCount,
  };
}
