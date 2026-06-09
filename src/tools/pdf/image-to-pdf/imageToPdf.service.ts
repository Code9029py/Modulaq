// Adaptador delgado sobre @modulaq/core/pdf.
// Preserva la API histórica del service de Imagen a PDF:
//   createPdfFromImages, getSupportedImageType, isSupportedImageFile,
//   sanitizePdfFileName, defaultOutputFileName, formatFileSize, getBaseFileName.
//
// El SDK soporta PNG/JPG directamente; el caso WebP requiere conversión por canvas,
// que es DOM-dependent y por eso vive en este adaptador (no en el SDK).
import { imagesToPdf as coreImagesToPdf, type ImageInput } from "@modulaq/core/pdf";
import { ToolError } from "../../../shared/errors/ToolError";
import { buildDownloadFileName, getBaseFileName } from "../../../shared/utils/downloadFileName";
import { formatFileSize, toArrayBuffer } from "../../../shared/utils/file";
import {
  convertImageFileToPngBytes,
  getBrowserImageMimeType,
  isBrowserImageFile,
} from "../../../shared/utils/imageFiles";
import type { CreateImageToPdfOptions, ImageToPdfResult, SupportedImageMimeType } from "./imageToPdf.types";

export { formatFileSize, getBaseFileName };

export const defaultOutputFileName = "imagenes-a-pdf";

export function getSupportedImageType(file: File): SupportedImageMimeType | null {
  return getBrowserImageMimeType(file);
}

export function isSupportedImageFile(file: File) {
  return isBrowserImageFile(file);
}

export function sanitizePdfFileName(fileName: string) {
  return buildDownloadFileName(fileName, "pdf", defaultOutputFileName);
}

/**
 * Convierte un WebP a bytes PNG usando un canvas del navegador.
 * Esta funcion NO vive en el SDK porque depende del DOM.
 */
async function convertWebpToPngBytes(file: File): Promise<Uint8Array> {
  return convertImageFileToPngBytes(file);
}

async function prepareImageInput(file: File): Promise<ImageInput> {
  const imageType = getSupportedImageType(file);

  if (!imageType) {
    throw new ToolError("tools.errors.invalidImageNamed", { name: file.name });
  }

  if (imageType === "image/webp") {
    try {
      const bytes = await convertWebpToPngBytes(file);
      return { bytes, format: "png" };
    } catch {
      throw new ToolError("tools.errors.imageProcessFailedNamed", { name: file.name });
    }
  }

  return file;
}

export async function createPdfFromImages(
  files: File[],
  options: CreateImageToPdfOptions = {},
): Promise<ImageToPdfResult> {
  if (files.length === 0) {
    throw new ToolError("tools.errors.imageToPdfNeedOne");
  }

  const prepared: ImageInput[] = [];
  for (const file of files) {
    if (!isSupportedImageFile(file)) {
      throw new ToolError("tools.errors.invalidImageNamed", { name: file.name });
    }
    prepared.push(await prepareImageInput(file));
  }

  let bytes: Uint8Array;
  try {
    bytes = await coreImagesToPdf(prepared);
  } catch {
    throw new ToolError("tools.errors.imageToPdfFailed");
  }

  return {
    bytes: toArrayBuffer(bytes),
    fileName: sanitizePdfFileName(options.outputFileName ?? defaultOutputFileName),
    pageCount: files.length,
  };
}
