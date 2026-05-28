import { PDFDocument, type PDFImage } from "pdf-lib";
import { buildDownloadFileName, getBaseFileName } from "../../../shared/utils/downloadFileName";
import { formatFileSize, toArrayBuffer } from "../../../shared/utils/file";
import type { CreateImageToPdfOptions, ImageToPdfResult, SupportedImageMimeType } from "./imageToPdf.types";

export { formatFileSize, getBaseFileName };

const supportedImageTypes: SupportedImageMimeType[] = ["image/png", "image/jpeg", "image/webp"];
export const defaultOutputFileName = "imagenes-a-pdf";
const pageMargin = 36;
const a4Portrait = [595.28, 841.89] as const;
const a4Landscape = [841.89, 595.28] as const;

export function getSupportedImageType(file: File): SupportedImageMimeType | null {
  if (supportedImageTypes.includes(file.type as SupportedImageMimeType)) {
    return file.type as SupportedImageMimeType;
  }

  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".png")) {
    return "image/png";
  }

  if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (fileName.endsWith(".webp")) {
    return "image/webp";
  }

  return null;
}

export function isSupportedImageFile(file: File) {
  return getSupportedImageType(file) !== null;
}

export function sanitizePdfFileName(fileName: string) {
  return buildDownloadFileName(fileName, "pdf", defaultOutputFileName);
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.decoding = "async";

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("No se pudo leer la imagen."));
      image.src = imageUrl;
    });

    return image;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

async function convertWebpToPngBytes(file: File): Promise<Uint8Array> {
  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("No se pudo preparar la conversión de WebP.");
  }

  context.drawImage(image, 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) {
        resolve(nextBlob);
        return;
      }

      reject(new Error("No se pudo convertir la imagen WebP."));
    }, "image/png");
  });

  return new Uint8Array(await blob.arrayBuffer());
}

async function embedImage(pdfDocument: PDFDocument, file: File): Promise<PDFImage> {
  const imageType = getSupportedImageType(file);

  if (!imageType) {
    throw new Error("Formato de imagen no soportado.");
  }

  if (imageType === "image/webp") {
    return pdfDocument.embedPng(await convertWebpToPngBytes(file));
  }

  const fileBytes = new Uint8Array(await file.arrayBuffer());

  if (imageType === "image/jpeg") {
    return pdfDocument.embedJpg(fileBytes);
  }

  return pdfDocument.embedPng(fileBytes);
}

function getPageSize(image: PDFImage) {
  return image.width >= image.height ? a4Landscape : a4Portrait;
}

export async function createPdfFromImages(files: File[], options: CreateImageToPdfOptions = {}): Promise<ImageToPdfResult> {
  if (files.length === 0) {
    throw new Error("Agregá al menos una imagen para generar el PDF.");
  }

  const pdfDocument = await PDFDocument.create();

  for (const file of files) {
    if (!isSupportedImageFile(file)) {
      throw new Error(`"${file.name}" no es una imagen PNG, JPG o WebP válida.`);
    }

    try {
      const embeddedImage = await embedImage(pdfDocument, file);
      const [pageWidth, pageHeight] = getPageSize(embeddedImage);
      const page = pdfDocument.addPage([pageWidth, pageHeight]);
      const maxWidth = pageWidth - pageMargin * 2;
      const maxHeight = pageHeight - pageMargin * 2;
      const scale = Math.min(maxWidth / embeddedImage.width, maxHeight / embeddedImage.height);
      const imageWidth = embeddedImage.width * scale;
      const imageHeight = embeddedImage.height * scale;

      page.drawImage(embeddedImage, {
        x: (pageWidth - imageWidth) / 2,
        y: (pageHeight - imageHeight) / 2,
        width: imageWidth,
        height: imageHeight,
      });
    } catch {
      throw new Error(`No se pudo procesar "${file.name}". Verificá que la imagen no esté dañada.`);
    }
  }

  const pdfBytes = await pdfDocument.save();

  return {
    bytes: toArrayBuffer(pdfBytes),
    fileName: sanitizePdfFileName(options.outputFileName ?? defaultOutputFileName),
    pageCount: files.length,
  };
}
