import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import {
  countPdfPages as coreCountPdfPages,
  extractPdfPages as coreExtractPdfPages,
} from "@modulaq/core/pdf";
import { parsePageSelection } from "@modulaq/core/ranges";
import { getBaseFileName } from "../../../shared/utils/downloadFileName";
import { formatFileSize, isPdfFile, toArrayBuffer } from "../../../shared/utils/file";
import { validateParts } from "../../../shared/utils/pageRanges";
import type { SplitPdfMetadata, SplitPdfResult } from "./splitPdf.types";

export { getBaseFileName, formatFileSize, isPdfFile, parsePageSelection, validateParts };

export const defaultOutputBaseName = "archivo-dividido";

function cleanOutputBaseName(fileName: string) {
  const withoutKnownExtension = fileName.trim().replace(/\.(pdf|zip)$/i, "");
  return withoutKnownExtension
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "")
    .trim();
}

export function getOutputBaseNameError(fileName: string) {
  if (!fileName.trim()) {
    return null;
  }

  return cleanOutputBaseName(fileName)
    ? null
    : "El nombre de salida no contiene caracteres válidos.";
}

export function sanitizeOutputBaseName(fileName: string, fallbackBaseName = defaultOutputBaseName) {
  const sanitizedName = cleanOutputBaseName(fileName);
  const safeName = sanitizedName.length > 0 ? sanitizedName : fallbackBaseName;

  return /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(safeName) ? `${safeName}-archivo` : safeName;
}

export function getSuggestedOutputBaseName(fileName: string) {
  return sanitizeOutputBaseName(`${getBaseFileName(fileName)}-dividido`);
}

export function buildOutputFileName(baseName: string, extension: "pdf" | "zip", fallbackBaseName = defaultOutputBaseName) {
  const nameError = getOutputBaseNameError(baseName);

  if (nameError) {
    throw new Error(nameError);
  }

  return `${sanitizeOutputBaseName(baseName, fallbackBaseName)}.${extension}`;
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

async function createPdfFromPages(sourceDocument: PDFDocument, pageNumbers: number[]) {
  const resultDocument = await PDFDocument.create();
  const pages = await resultDocument.copyPages(
    sourceDocument,
    pageNumbers.map((pageNumber) => pageNumber - 1),
  );

  pages.forEach((page) => resultDocument.addPage(page));

  return resultDocument.save();
}

export async function readPdfMetadata(file: File): Promise<SplitPdfMetadata> {
  const pdfDocument = await loadPdfDocument(file);

  return {
    fileName: file.name,
    fileSize: file.size,
    pageCount: pdfDocument.getPageCount(),
  };
}

export async function extractSelectedPages(
  file: File,
  pageSelection: string,
  outputBaseName: string,
): Promise<SplitPdfResult> {
  if (!isPdfFile(file)) {
    throw new Error("Seleccioná un archivo PDF válido.");
  }

  let pageCount: number;
  try {
    pageCount = await coreCountPdfPages(file);
  } catch {
    throw new Error("No se pudo leer el PDF. Puede estar dañado, protegido o incompleto.");
  }

  const selection = parsePageSelection(pageSelection, pageCount);

  if (selection.error) {
    throw new Error(selection.error);
  }

  const fallbackBaseName = getSuggestedOutputBaseName(file.name);

  let bytes: Uint8Array;
  try {
    bytes = await coreExtractPdfPages(file, selection.pages);
  } catch {
    throw new Error("No se pudo leer el PDF. Puede estar dañado, protegido o incompleto.");
  }

  return {
    bytes: toArrayBuffer(bytes),
    fileName: buildOutputFileName(outputBaseName, "pdf", fallbackBaseName),
    mimeType: "application/pdf",
    outputCount: 1,
    pageCount: selection.pages.length,
  };
}

export async function createZipFromParts(
  file: File,
  parts: string[],
  outputBaseName: string,
): Promise<SplitPdfResult> {
  const sourceDocument = await loadPdfDocument(file);
  const validation = validateParts(parts, sourceDocument.getPageCount());
  const fallbackBaseName = getSuggestedOutputBaseName(file.name);

  if (!validation.isValid) {
    throw new Error(validation.error ?? "Revisá la asignación de páginas.");
  }

  const safeBaseName = sanitizeOutputBaseName(outputBaseName, fallbackBaseName);
  const zip = new JSZip();

  for (let index = 0; index < validation.pagesByPart.length; index += 1) {
    zip.file(`${safeBaseName}-parte-${index + 1}.pdf`, await createPdfFromPages(sourceDocument, validation.pagesByPart[index]));
  }

  return {
    bytes: await zip.generateAsync({ type: "arraybuffer" }),
    fileName: buildOutputFileName(outputBaseName, "zip", fallbackBaseName),
    mimeType: "application/zip",
    outputCount: parts.length,
    pageCount: sourceDocument.getPageCount(),
  };
}

export async function splitPdfIntoIndividualPages(file: File, outputBaseName: string): Promise<SplitPdfResult> {
  const sourceDocument = await loadPdfDocument(file);
  const pageCount = sourceDocument.getPageCount();
  const fallbackBaseName = getSuggestedOutputBaseName(file.name);

  if (pageCount === 1) {
    return {
      bytes: toArrayBuffer(await createPdfFromPages(sourceDocument, [1])),
      fileName: buildOutputFileName(outputBaseName, "pdf", fallbackBaseName),
      mimeType: "application/pdf",
      outputCount: 1,
      pageCount,
    };
  }

  const safeBaseName = sanitizeOutputBaseName(outputBaseName, fallbackBaseName);
  const zip = new JSZip();

  for (let index = 0; index < pageCount; index += 1) {
    zip.file(`${safeBaseName}-pagina-${index + 1}.pdf`, await createPdfFromPages(sourceDocument, [index + 1]));
  }

  return {
    bytes: await zip.generateAsync({ type: "arraybuffer" }),
    fileName: buildOutputFileName(outputBaseName, "zip", fallbackBaseName),
    mimeType: "application/zip",
    outputCount: pageCount,
    pageCount,
  };
}
