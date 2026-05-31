// Adaptador delgado sobre @modulaq/core/pdf.
// Preserva la API histórica del service de Imagen a PDF:
//   createPdfFromImages, getSupportedImageType, isSupportedImageFile,
//   sanitizePdfFileName, defaultOutputFileName, formatFileSize, getBaseFileName.
//
// El SDK soporta PNG/JPG directamente; el caso WebP requiere conversión por canvas,
// que es DOM-dependent y por eso vive en este adaptador (no en el SDK).
import { imagesToPdf as coreImagesToPdf, type ImageInput } from "@modulaq/core/pdf";
import { buildDownloadFileName, getBaseFileName } from "../../../shared/utils/downloadFileName";
import { formatFileSize, toArrayBuffer } from "../../../shared/utils/file";
import type { CreateImageToPdfOptions, ImageToPdfResult, SupportedImageMimeType } from "./imageToPdf.types";

export { formatFileSize, getBaseFileName };

const supportedImageTypes: SupportedImageMimeType[] = ["image/png", "image/jpeg", "image/webp"];
export const defaultOutputFileName = "imagenes-a-pdf";

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

/**
 * Convierte un WebP a bytes PNG usando un canvas del navegador.
 * Esta función NO vive en el SDK porque depende del DOM.
 */
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

async function prepareImageInput(file: File): Promise<ImageInput> {
  const imageType = getSupportedImageType(file);

  if (!imageType) {
    throw new Error(`"${file.name}" no es una imagen PNG, JPG o WebP válida.`);
  }

  if (imageType === "image/webp") {
    try {
      const bytes = await convertWebpToPngBytes(file);
      return { bytes, format: "png" };
    } catch {
      throw new Error(`No se pudo procesar "${file.name}". Verificá que la imagen no esté dañada.`);
    }
  }

  return file;
}

export async function createPdfFromImages(
  files: File[],
  options: CreateImageToPdfOptions = {},
): Promise<ImageToPdfResult> {
  if (files.length === 0) {
    throw new Error("Agregá al menos una imagen para generar el PDF.");
  }

  const prepared: ImageInput[] = [];
  for (const file of files) {
    if (!isSupportedImageFile(file)) {
      throw new Error(`"${file.name}" no es una imagen PNG, JPG o WebP válida.`);
    }
    prepared.push(await prepareImageInput(file));
  }

  let bytes: Uint8Array;
  try {
    bytes = await coreImagesToPdf(prepared);
  } catch {
    throw new Error("No se pudo generar el PDF a partir de las imágenes. Verificá que no estén dañadas.");
  }

  return {
    bytes: toArrayBuffer(bytes),
    fileName: sanitizePdfFileName(options.outputFileName ?? defaultOutputFileName),
    pageCount: files.length,
  };
}
