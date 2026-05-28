import { PDFDocument } from "pdf-lib";
import { buildDownloadFileName, getBaseFileName } from "../../../shared/utils/downloadFileName";
import { formatFileSize, isPdfFile, toArrayBuffer } from "../../../shared/utils/file";
import type { MergePdfFileMetadata, MergePdfOptions, MergePdfResult } from "./mergePdf.types";

export { formatFileSize, isPdfFile, getBaseFileName };

export const defaultOutputFileName = "pdfs-unidos";

export function sanitizePdfFileName(fileName: string) {
  return buildDownloadFileName(fileName, "pdf", defaultOutputFileName);
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
