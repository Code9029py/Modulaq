import { PDFDocument } from "pdf-lib";
import type { MergePdfFileMetadata, MergePdfOptions, MergePdfResult } from "./mergePdf.types";

export const defaultOutputFileName = "pdfs-unidos";

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

export function getBaseFileName(fileName: string) {
  const nameWithoutPath = fileName.split(/[/\\]/).pop() ?? fileName;
  const extensionIndex = nameWithoutPath.lastIndexOf(".");

  if (extensionIndex <= 0) {
    return nameWithoutPath;
  }

  return nameWithoutPath.slice(0, extensionIndex);
}

export function sanitizePdfFileName(fileName: string) {
  const trimmedName = fileName.trim();
  const nameWithFallback = trimmedName.length > 0 ? trimmedName : defaultOutputFileName;
  const withoutPdfExtension = nameWithFallback.replace(/\.pdf$/i, "");
  const sanitizedBaseName = withoutPdfExtension
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "")
    .trim();
  const safeBaseName = sanitizedBaseName.length > 0 ? sanitizedBaseName : defaultOutputFileName;

  return `${safeBaseName}.pdf`;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function loadPdfDocument(file: File) {
  try {
    return await PDFDocument.load(await file.arrayBuffer(), {
      ignoreEncryption: true,
    });
  } catch {
    throw new Error(`No se pudo leer "${file.name}". Puede estar dañado, protegido o incompleto.`);
  }
}

export async function readPdfMetadata(file: File): Promise<MergePdfFileMetadata> {
  if (!isPdfFile(file)) {
    throw new Error(`"${file.name}" no es un archivo PDF válido.`);
  }

  const pdfDocument = await loadPdfDocument(file);

  return {
    fileName: file.name,
    fileSize: file.size,
    pageCount: pdfDocument.getPageCount(),
  };
}

export async function mergePdfFiles(files: File[], options: MergePdfOptions = {}): Promise<MergePdfResult> {
  if (files.length < 2) {
    throw new Error("Agregá al menos dos PDFs para unirlos.");
  }

  const mergedDocument = await PDFDocument.create();
  let pageCount = 0;

  for (const file of files) {
    if (!isPdfFile(file)) {
      throw new Error(`"${file.name}" no es un archivo PDF válido.`);
    }

    const sourceDocument = await loadPdfDocument(file);
    const copiedPages = await mergedDocument.copyPages(sourceDocument, sourceDocument.getPageIndices());

    copiedPages.forEach((page) => mergedDocument.addPage(page));
    pageCount += copiedPages.length;
  }

  try {
    const pdfBytes = await mergedDocument.save();

    return {
      bytes: toArrayBuffer(pdfBytes),
      fileName: sanitizePdfFileName(options.outputFileName ?? defaultOutputFileName),
      pageCount,
    };
  } catch {
    throw new Error("No se pudo generar el PDF final. Probá quitar el archivo problemático e intentá de nuevo.");
  }
}
