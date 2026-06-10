// Adaptador delgado sobre @modulaq/core/pdf.addPageNumbers.
import {
  addPageNumbers as coreAddPageNumbers,
  countPdfPages as coreCountPdfPages,
} from "@modulaq/core/pdf";
import { ToolError } from "../../../shared/errors/ToolError";
import { buildDownloadFileName, getSuggestedDownloadBaseName } from "../../../shared/utils/downloadFileName";
import { formatFileSize, isPdfFile, toArrayBuffer } from "../../../shared/utils/file";
import type {
  AddPageNumbersFormOptions,
  AddPageNumbersMetadata,
  AddPageNumbersResult,
} from "./addPageNumbers.types";

export { formatFileSize, isPdfFile };

export const defaultOutputBaseName = "pdf-numerado";

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

export async function addPageNumbersToFile(
  file: File,
  options: AddPageNumbersFormOptions,
  outputBaseName: string,
): Promise<AddPageNumbersResult> {
  if (!isPdfFile(file)) {
    throw new ToolError("tools.errors.invalidPdf");
  }

  let bytes: Uint8Array;
  try {
    bytes = await coreAddPageNumbers(file, { position: options.position });
  } catch {
    throw new ToolError("tools.errors.addPageNumbersFailed");
  }

  const pageCount = await coreCountPdfPages(bytes);

  return {
    bytes: toArrayBuffer(bytes),
    fileName: getOutputFileName(outputBaseName, getSuggestedOutputBaseName(file.name)),
    pageCount,
  };
}
