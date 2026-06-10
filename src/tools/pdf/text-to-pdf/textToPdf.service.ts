// Adaptador delgado sobre @modulaq/core/pdf.textToPdf.
// Encapsula validación, fallback de filename y mapeo de errores a ToolError.
import { countPdfPages as coreCountPdfPages, textToPdf as coreTextToPdf } from "@modulaq/core/pdf";
import { ToolError } from "../../../shared/errors/ToolError";
import { buildDownloadFileName } from "../../../shared/utils/downloadFileName";
import { toArrayBuffer } from "../../../shared/utils/file";
import type { TextToPdfFormOptions, TextToPdfResult } from "./textToPdf.types";

export const defaultOutputBaseName = "texto-a-pdf";

/** Caracteres máximos de texto. Generoso pero finito para evitar OOM. */
export const MAX_TEXT_LENGTH = 200_000;

export function buildOutputFileName(baseName: string): string {
  return buildDownloadFileName(baseName, "pdf", defaultOutputBaseName);
}

export async function generateTextPdf(
  text: string,
  options: TextToPdfFormOptions,
  outputBaseName: string = defaultOutputBaseName,
): Promise<TextToPdfResult> {
  if (text.trim().length === 0) {
    throw new ToolError("tools.errors.textToPdfEmpty");
  }
  if (text.length > MAX_TEXT_LENGTH) {
    throw new ToolError("tools.errors.textToPdfTooLong", { limit: MAX_TEXT_LENGTH });
  }

  let bytes: Uint8Array;
  try {
    bytes = await coreTextToPdf(text, {
      title: options.title.trim() || undefined,
      fontSize: options.fontSize,
      margin: options.margin,
      pageSize: options.pageSize,
    });
  } catch {
    throw new ToolError("tools.errors.textToPdfFailed");
  }

  const pageCount = await coreCountPdfPages(bytes);

  return {
    bytes: toArrayBuffer(bytes),
    fileName: buildOutputFileName(outputBaseName),
    pageCount,
  };
}
