import JSZip from "jszip";
import { EncryptedPDFError, PDFDocument } from "pdf-lib";
import { buildDownloadFileName, getSuggestedDownloadBaseName, sanitizeDownloadBaseName } from "../../../shared/utils/downloadFileName";
import type { CompressPdfDownload, CompressPdfMetadata, CompressPdfResult } from "./compressPdf.types";

export const defaultOutputBaseName = "pdf-comprimido";
const minimumSignificantReductionBytes = 1024;
const minimumSignificantReductionPercentage = 1;
const encryptedPdfMessage = "Este PDF está protegido o encriptado y no se puede comprimir desde esta herramienta.";
const unreadablePdfMessage =
  "No se pudo procesar este PDF con la librería actual. Puede estar protegido, usar una estructura no compatible o estar incompleto.";

export function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  return `${(kilobytes / 1024).toFixed(2)} MB`;
}

export function formatSizeDifference(bytes: number) {
  return bytes > 0 ? `-${formatFileSize(bytes)}` : "Sin reducción";
}

export function getSuggestedOutputBaseName(fileName: string) {
  return getSuggestedDownloadBaseName(fileName, defaultOutputBaseName);
}

export function getDownloadFileName(outputBaseName: string, multiple: boolean, fallbackBaseName = defaultOutputBaseName) {
  return buildDownloadFileName(outputBaseName, multiple ? "zip" : "pdf", fallbackBaseName);
}

function getCompressedEntryFileName(fileName: string) {
  const baseName = sanitizeDownloadBaseName(`${getSuggestedOutputBaseName(fileName)}-comprimido`, defaultOutputBaseName);
  return `${baseName}.pdf`;
}

function toArrayBuffer(bytes: Uint8Array) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function loadPdfDocument(bytes: ArrayBuffer) {
  try {
    return await PDFDocument.load(bytes, {
      updateMetadata: false,
    });
  } catch (error) {
    if (error instanceof EncryptedPDFError) {
      throw new Error(encryptedPdfMessage);
    }

    console.error("[Comprimir PDF] pdf-lib no pudo cargar el documento.", error);
    throw new Error(unreadablePdfMessage);
  }
}

export async function readPdfMetadata(file: File): Promise<CompressPdfMetadata> {
  if (!isPdfFile(file)) {
    throw new Error("Seleccioná un archivo PDF válido.");
  }

  const pdfDocument = await loadPdfDocument(await file.arrayBuffer());

  return {
    fileName: file.name,
    fileSize: file.size,
    pageCount: pdfDocument.getPageCount(),
  };
}

export async function compressPdf(file: File): Promise<CompressPdfResult> {
  if (!isPdfFile(file)) {
    throw new Error("Seleccioná un archivo PDF válido.");
  }

  const originalBuffer = await file.arrayBuffer();
  const originalSize = originalBuffer.byteLength;
  const pdfDocument = await loadPdfDocument(originalBuffer);

  try {
    const optimizedBytes = await pdfDocument.save({
      addDefaultPage: false,
      updateFieldAppearances: false,
      useObjectStreams: true,
    });
    const optimizedSize = optimizedBytes.byteLength;
    const isSmaller = optimizedSize < originalSize;
    const outputBytes = isSmaller ? toArrayBuffer(optimizedBytes) : originalBuffer;
    const outputSize = outputBytes.byteLength;
    const savedBytes = originalSize - outputSize;
    const reductionPercentage = originalSize === 0 ? 0 : (savedBytes / originalSize) * 100;
    const hasSignificantReduction =
      isSmaller &&
      (savedBytes >= minimumSignificantReductionBytes || reductionPercentage >= minimumSignificantReductionPercentage);

    return {
      bytes: outputBytes,
      fileName: getCompressedEntryFileName(file.name),
      originalSize,
      outputSize,
      savedBytes,
      reductionPercentage,
      pageCount: pdfDocument.getPageCount(),
      isSmaller,
      hasSignificantReduction,
      preservedOriginal: !isSmaller,
    };
  } catch {
    throw new Error("No se pudo optimizar este PDF. Probá nuevamente con otro archivo.");
  }
}

function getUniqueZipName(fileName: string, usedNames: Set<string>) {
  if (!usedNames.has(fileName)) {
    usedNames.add(fileName);
    return fileName;
  }

  const baseName = fileName.replace(/\.pdf$/i, "");
  let index = 2;
  let candidate = `${baseName}-${index}.pdf`;

  while (usedNames.has(candidate)) {
    index += 1;
    candidate = `${baseName}-${index}.pdf`;
  }

  usedNames.add(candidate);
  return candidate;
}

export async function createCompressedDownload(
  results: CompressPdfResult[],
  outputBaseName: string,
  forceZip = false,
  fallbackBaseName = defaultOutputBaseName,
): Promise<CompressPdfDownload> {
  if (results.length === 0) {
    throw new Error("No hay resultados para descargar.");
  }

  if (results.length === 1 && !forceZip) {
    return {
      bytes: results[0].bytes,
      fileName: getDownloadFileName(outputBaseName, false, fallbackBaseName),
      mimeType: "application/pdf",
      outputCount: 1,
    };
  }

  const zip = new JSZip();
  const usedNames = new Set<string>();

  results.forEach((result) => {
    zip.file(getUniqueZipName(result.fileName, usedNames), result.bytes);
  });

  return {
    bytes: await zip.generateAsync({ type: "arraybuffer" }),
    fileName: getDownloadFileName(outputBaseName, true, fallbackBaseName),
    mimeType: "application/zip",
    outputCount: results.length,
  };
}
