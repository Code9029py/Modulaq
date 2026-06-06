// Adaptador delgado sobre @modulaq/core (countPdfPages de /pdf + pdfToImages de /pdf-render).
// Preserva la API histórica que el componente espera:
//   convertPdfPagesToImages, createAllPageNumbers, defaultOutputBaseName,
//   formatFileSize, isPdfFile, parsePageRange, readPdfMetadata.
//
// Lo que queda en el adapter (no pertenece al SDK):
//   - parsePageRange (forma específica de esta herramienta).
//   - empaquetado ZIP multipágina (jszip).
//   - composición del nombre de archivo de salida.
//   - mensajes de error en español y validaciones UX.
import JSZip from "jszip";
import { countPdfPages as coreCountPdfPages } from "@modulaq/core/pdf";
import {
  configurePdfWorker,
  pdfToImages as corePdfToImages,
  type PdfPageImage,
} from "@modulaq/core/pdf-render";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { getSuggestedDownloadBaseName } from "../../../shared/utils/downloadFileName";
import { formatFileSize, isPdfFile } from "../../../shared/utils/file";
import {
  buildImageDownloadFileName,
  buildImageZipDownloadFileName,
  buildPagedImageFileName,
  getImageDownloadBaseName,
  getImageOutputMimeType,
  normalizeJpegQuality,
} from "../../../shared/utils/imageFiles";
import type {
  PdfPageRangeResult,
  PdfToImagesMetadata,
  PdfToImagesOutputFormat,
  PdfToImagesProgress,
  PdfToImagesResult,
} from "./pdfToImages.types";

// Configurar el worker de pdfjs-dist una sola vez al cargar el módulo.
configurePdfWorker(pdfWorkerUrl);

const renderScale = 2;
export const defaultOutputBaseName = "paginas-pdf";
const pdfReadErrorMessage = "No se pudo leer el PDF. Verificá que el archivo no esté dañado o protegido.";

export { formatFileSize, isPdfFile };

export function createAllPageNumbers(pageCount: number) {
  return Array.from({ length: pageCount }, (_, index) => index + 1);
}

export function parsePageRange(input: string, pageCount: number): PdfPageRangeResult {
  const selection = input.trim();

  if (!selection) {
    return {
      duplicatesRemoved: false,
      error: "Ingresá al menos una página o rango para convertir.",
      pages: [],
    };
  }

  const pages: number[] = [];
  const includedPages = new Set<number>();
  let duplicatesRemoved = false;

  for (const rawToken of selection.split(",")) {
    const token = rawToken.trim();
    const pageMatch = token.match(/^(\d+)$/);
    const rangeMatch = token.match(/^(\d+)\s*-\s*(\d+)$/);

    if (!pageMatch && !rangeMatch) {
      return {
        duplicatesRemoved: false,
        error: "Usá páginas o rangos separados por comas, por ejemplo 1-3,5,8-10.",
        pages: [],
      };
    }

    const startPage = Number(pageMatch?.[1] ?? rangeMatch?.[1]);
    const endPage = Number(pageMatch?.[1] ?? rangeMatch?.[2]);

    if (startPage < 1 || endPage < 1 || startPage > pageCount || endPage > pageCount) {
      return {
        duplicatesRemoved: false,
        error: `Usá páginas entre 1 y ${pageCount}.`,
        pages: [],
      };
    }

    if (endPage < startPage) {
      return {
        duplicatesRemoved: false,
        error: `El rango ${startPage}-${endPage} no es válido. La página inicial no puede ser mayor que la final.`,
        pages: [],
      };
    }

    for (let pageNumber = startPage; pageNumber <= endPage; pageNumber += 1) {
      if (includedPages.has(pageNumber)) {
        duplicatesRemoved = true;
        continue;
      }

      includedPages.add(pageNumber);
      pages.push(pageNumber);
    }
  }

  return { duplicatesRemoved, error: null, pages };
}

export async function readPdfMetadata(file: File): Promise<PdfToImagesMetadata> {
  if (!isPdfFile(file)) {
    throw new Error("Seleccioná un archivo PDF válido.");
  }

  try {
    const pageCount = await coreCountPdfPages(file);
    return {
      fileName: file.name,
      fileSize: file.size,
      pageCount,
    };
  } catch {
    throw new Error(pdfReadErrorMessage);
  }
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function validateSelectedPages(pages: number[], pageCount: number) {
  if (pages.length === 0) {
    throw new Error("Seleccioná al menos una página para convertir.");
  }

  if (pages.some((pageNumber) => pageNumber < 1 || pageNumber > pageCount)) {
    throw new Error(`Elegí páginas entre 1 y ${pageCount}.`);
  }
}

export async function convertPdfPagesToImages(
  file: File,
  pages: number[],
  outputBaseName: string,
  outputFormat: PdfToImagesOutputFormat = "png",
  jpegQuality?: number,
  onProgress?: (progress: PdfToImagesProgress) => void,
): Promise<PdfToImagesResult> {
  if (!isPdfFile(file)) {
    throw new Error("Seleccioná un archivo PDF válido.");
  }

  let pageCount: number;
  try {
    pageCount = await coreCountPdfPages(file);
  } catch {
    throw new Error(pdfReadErrorMessage);
  }

  validateSelectedPages(pages, pageCount);

  onProgress?.({ current: 0, total: pages.length });

  const fallbackBaseName = getSuggestedDownloadBaseName(file.name, defaultOutputBaseName);
  const baseName = getImageDownloadBaseName(outputBaseName, fallbackBaseName);

  let renderedImages: PdfPageImage[];
  try {
    renderedImages = await corePdfToImages(file, {
      pages,
      scale: renderScale,
      format: outputFormat,
      quality: outputFormat === "jpeg" ? normalizeJpegQuality(jpegQuality) : undefined,
    });
  } catch (error) {
    if (error instanceof Error && /página\s+\d+/i.test(error.message)) {
      throw new Error(`No se pudo convertir la página: ${error.message}`);
    }
    throw new Error("No se pudieron convertir las páginas a imágenes.");
  }

  onProgress?.({ current: renderedImages.length, total: renderedImages.length });

  if (renderedImages.length === 1) {
    const single = renderedImages[0];
    return {
      bytes: toArrayBuffer(single.bytes),
      fileName: buildImageDownloadFileName(outputBaseName, outputFormat, fallbackBaseName),
      imageCount: 1,
      mimeType: getImageOutputMimeType(outputFormat),
    };
  }

  const zip = new JSZip();
  for (const image of renderedImages) {
    zip.file(buildPagedImageFileName(baseName, image.pageNumber, pageCount, outputFormat), image.bytes);
  }

  try {
    const zipBytes = await zip.generateAsync({ type: "arraybuffer" });
    return {
      bytes: zipBytes,
      fileName: buildImageZipDownloadFileName(outputBaseName, fallbackBaseName),
      imageCount: renderedImages.length,
      mimeType: "application/zip",
    };
  } catch {
    throw new Error("No se pudo preparar la descarga ZIP.");
  }
}
