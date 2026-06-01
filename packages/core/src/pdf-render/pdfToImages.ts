import { ensureWorkerConfigured, loadPdfJsDocument } from "./shared";
import type {
  PdfImageFormat,
  PdfInput,
  PdfPageImage,
  PdfToImagesOptions,
} from "./types";

function defaultCreateCanvas(): HTMLCanvasElement {
  return document.createElement("canvas");
}

async function canvasToImageBytes(
  canvas: HTMLCanvasElement,
  format: PdfImageFormat,
  quality: number,
): Promise<Uint8Array> {
  const mimeType = format === "png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
          return;
        }
        reject(new Error(`pdfToImages: el canvas no pudo generar ${format.toUpperCase()}.`));
      },
      mimeType,
      format === "jpeg" ? quality : undefined,
    );
  });
  return new Uint8Array(await blob.arrayBuffer());
}

/**
 * Renderiza páginas de un PDF a PNG o JPEG.
 *
 * - Procesa **secuencialmente** una página por vez (memoria acotada).
 * - Por default usa `document.createElement("canvas")`. Pasá `createCanvas`
 *   para usar `OffscreenCanvas`, un polyfill de Node u otro backend.
 * - Devuelve una imagen por cada página solicitada (default: todas).
 *
 * Requiere `configurePdfWorker(...)` previo; si no, lanza un `Error` claro.
 *
 * El SDK NO empaqueta en ZIP ni nombra archivos: devuelve primitivas
 * (`bytes`, `width`, `height`, `pageNumber`) y deja la composición al consumidor.
 */
export async function pdfToImages(
  input: PdfInput,
  options: PdfToImagesOptions = {},
): Promise<PdfPageImage[]> {
  ensureWorkerConfigured();

  const scale = options.scale ?? 2;
  const format: PdfImageFormat = options.format ?? "png";
  const quality = options.quality ?? 0.92;
  const createCanvas = options.createCanvas ?? defaultCreateCanvas;

  const pdf = await loadPdfJsDocument(input);
  const results: PdfPageImage[] = [];

  try {
    const pageNumbers =
      options.pages ?? Array.from({ length: pdf.numPages }, (_, index) => index + 1);

    if (pageNumbers.length === 0) {
      throw new Error("pdfToImages: el array `pages` no puede estar vacío.");
    }

    for (const pageNumber of pageNumbers) {
      if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > pdf.numPages) {
        throw new Error(
          `pdfToImages: la página ${pageNumber} está fuera de rango (1..${pdf.numPages}).`,
        );
      }

      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = createCanvas();
      const context = canvas.getContext("2d", { alpha: false });

      if (!context) {
        throw new Error("pdfToImages: no se pudo obtener el contexto 2D del canvas.");
      }

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      await page.render({ canvas, canvasContext: context, viewport }).promise;

      const bytes = await canvasToImageBytes(canvas, format, quality);

      results.push({
        pageNumber,
        bytes,
        width: canvas.width,
        height: canvas.height,
      });
    }
  } finally {
    await pdf.destroy();
  }

  return results;
}
