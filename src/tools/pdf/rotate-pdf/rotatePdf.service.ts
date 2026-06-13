// Adaptador delgado sobre @modulaq/core/pdf.rotatePdfPages.
import {
  countPdfPages as coreCountPdfPages,
  rotatePdfPages as coreRotatePdfPages,
  type PdfRotation,
} from "@modulaq/core/pdf";
import { ToolError } from "../../../shared/errors/ToolError";
import type { Language } from "../../../shared/i18n/types";
import { buildDownloadFileName, getSuggestedDownloadBaseName } from "../../../shared/utils/downloadFileName";
import { formatFileSize, isPdfFile, toArrayBuffer } from "../../../shared/utils/file";
import type { RotatePdfMetadata, RotatePdfResult } from "./rotatePdf.types";

export { formatFileSize, isPdfFile };
export type { PdfRotation };

export const PDF_ROTATIONS: readonly PdfRotation[] = [90, 180, 270];

export const defaultOutputBaseName = "pdf-rotado";
const defaultOutputBaseNames: Record<Language, string> = {
  es: defaultOutputBaseName,
  en: "rotated-pdf",
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

function isGeneratedPdfValidationError(error: unknown): boolean {
  return error instanceof Error && error.name === "GeneratedPdfValidationError";
}

async function readPageCount(file: File): Promise<number> {
  try {
    return await coreCountPdfPages(file);
  } catch {
    throw new ToolError("tools.errors.unreadablePdf");
  }
}

export async function readPdfMetadata(file: File): Promise<RotatePdfMetadata> {
  if (!isPdfFile(file)) {
    throw new ToolError("tools.errors.invalidPdf");
  }
  const pageCount = await readPageCount(file);
  return { fileName: file.name, fileSize: file.size, pageCount };
}

export async function rotatePdfFromFile(
  file: File,
  rotation: PdfRotation,
  outputBaseName: string,
  fallbackBaseName: string = defaultOutputBaseName,
): Promise<RotatePdfResult> {
  if (!isPdfFile(file)) {
    throw new ToolError("tools.errors.invalidPdf");
  }

  const pageCount = await readPageCount(file);

  let bytes: Uint8Array;
  try {
    bytes = await coreRotatePdfPages(file, rotation);
  } catch (error) {
    if (isGeneratedPdfValidationError(error)) {
      throw new ToolError("tools.errors.rotatePdfOutputInvalid");
    }
    throw new ToolError("tools.errors.rotatePdfFailed");
  }

  return {
    bytes: toArrayBuffer(bytes),
    fileName: getOutputFileName(outputBaseName, getSuggestedOutputBaseName(file.name, fallbackBaseName)),
    pageCount,
    rotation,
  };
}
