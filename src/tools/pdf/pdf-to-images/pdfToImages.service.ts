import JSZip from "jszip";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { buildDownloadFileName, getSuggestedDownloadBaseName, sanitizeDownloadBaseName } from "../../../shared/utils/downloadFileName";
import type {
  PdfPageRangeResult,
  PdfToImagesMetadata,
  PdfToImagesProgress,
  PdfToImagesResult,
} from "./pdfToImages.types";

const renderScale = 2;
export const defaultOutputBaseName = "paginas-pdf";
const pdfReadErrorMessage = "No se pudo leer el PDF. Verificá que el archivo no esté dañado o protegido.";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

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

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function loadPdfDocument(file: File) {
  if (!isPdfFile(file)) {
    throw new Error("Seleccioná un archivo PDF válido.");
  }

  let arrayBuffer: ArrayBuffer;

  try {
    arrayBuffer = await file.arrayBuffer();
  } catch (error) {
    console.error("[PDF a imágenes] No se pudo leer el archivo seleccionado.", error);
    throw new Error(pdfReadErrorMessage);
  }

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
    });

    return await loadingTask.promise;
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "";
    const errorText = error instanceof Error ? error.message : String(error);
    const isWorkerError = /worker/i.test(`${errorName} ${errorText}`);
    const detail = isWorkerError ? "Error del worker de PDF.js." : "PDF.js rechazó el archivo; puede estar dañado o protegido.";

    console.error(`[PDF a imágenes] ${detail}`, error);
    throw new Error(pdfReadErrorMessage);
  }
}

export async function readPdfMetadata(file: File): Promise<PdfToImagesMetadata> {
  const pdfDocument = await loadPdfDocument(file);

  try {
    return {
      fileName: file.name,
      fileSize: file.size,
      pageCount: pdfDocument.numPages,
    };
  } finally {
    await pdfDocument.destroy();
  }
}

function getPngFileName(baseName: string, pageNumber: number, pageCount: number) {
  const pageLabel = String(pageNumber).padStart(String(pageCount).length, "0");
  return `${baseName}-pagina-${pageLabel}.png`;
}

function canvasToPngBytes(canvas: HTMLCanvasElement) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("No se pudo generar la imagen PNG."));
        return;
      }

      void blob.arrayBuffer().then(resolve, reject);
    }, "image/png");
  });
}

async function renderPageAsPng(pdfDocument: PDFDocumentProxy, pageNumber: number) {
  const page = await pdfDocument.getPage(pageNumber);
  const viewport = page.getViewport({ scale: renderScale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    throw new Error("No se pudo preparar el lienzo para renderizar la página.");
  }

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  await page.render({
    canvas,
    canvasContext: context,
    viewport,
  }).promise;

  return canvasToPngBytes(canvas);
}

function validateSelectedPages(pages: number[], pageCount: number) {
  if (pages.length === 0) {
    throw new Error("Seleccioná al menos una página para convertir.");
  }

  if (pages.some((pageNumber) => pageNumber < 1 || pageNumber > pageCount)) {
    throw new Error(`Elegí páginas entre 1 y ${pageCount}.`);
  }
}

export async function convertPdfPagesToPng(
  file: File,
  pages: number[],
  outputBaseName: string,
  onProgress?: (progress: PdfToImagesProgress) => void,
): Promise<PdfToImagesResult> {
  const pdfDocument = await loadPdfDocument(file);
  const fallbackBaseName = getSuggestedDownloadBaseName(file.name, defaultOutputBaseName);
  const baseName = sanitizeDownloadBaseName(outputBaseName, fallbackBaseName);

  try {
    validateSelectedPages(pages, pdfDocument.numPages);
    const renderedImages: Array<{ bytes: ArrayBuffer; fileName: string }> = [];

    for (let index = 0; index < pages.length; index += 1) {
      const pageNumber = pages[index];
      onProgress?.({ current: index + 1, total: pages.length });

      try {
        renderedImages.push({
          bytes: await renderPageAsPng(pdfDocument, pageNumber),
          fileName: getPngFileName(baseName, pageNumber, pdfDocument.numPages),
        });
      } catch {
        throw new Error(`No se pudo convertir la página ${pageNumber}. Verificá que el PDF sea válido.`);
      }
    }

    if (renderedImages.length === 1) {
      return {
        bytes: renderedImages[0].bytes,
        fileName: buildDownloadFileName(outputBaseName, "png", fallbackBaseName),
        imageCount: 1,
        mimeType: "image/png",
      };
    }

    const zip = new JSZip();
    renderedImages.forEach((image) => zip.file(image.fileName, image.bytes));

    try {
      return {
        bytes: await zip.generateAsync({ type: "arraybuffer" }),
        fileName: buildDownloadFileName(outputBaseName, "zip", fallbackBaseName),
        imageCount: renderedImages.length,
        mimeType: "application/zip",
      };
    } catch {
      throw new Error("No se pudo preparar la descarga ZIP.");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("No se pudieron convertir las páginas a imágenes.");
  } finally {
    await pdfDocument.destroy();
  }
}
