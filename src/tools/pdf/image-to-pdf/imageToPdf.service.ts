import { PDFDocument, type PDFImage } from "pdf-lib";
import type { CreateImageToPdfOptions, ImageToPdfResult, SupportedImageMimeType } from "./imageToPdf.types";

const supportedImageTypes: SupportedImageMimeType[] = ["image/png", "image/jpeg", "image/webp"];
export const defaultOutputFileName = "imagenes-a-pdf";
const pageMargin = 36;
const a4Portrait = [595.28, 841.89] as const;
const a4Landscape = [841.89, 595.28] as const;

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
