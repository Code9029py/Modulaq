import { formatFileSize } from "../../../shared/utils/file";
import {
  buildBrowserImageDownloadFileName,
  canExportBrowserImageFormat,
  exportBrowserImageFile,
  getBrowserImageMimeType,
  getBrowserImageOutputMimeType,
  getImageDownloadBaseName,
  isBrowserImageFile,
  loadBrowserImage,
} from "../../../shared/utils/imageFiles";
import type {
  ConvertImageOptions,
  ImageConverterMetadata,
  ImageConverterOutputFormat,
  ImageConverterResult,
} from "./imageConverter.types";

export const defaultOutputBaseName = "imagen-convertida";

export { formatFileSize };

export function isConvertibleImageFile(file: File) {
  return isBrowserImageFile(file);
}

export function getImageFormatLabel(format: ImageConverterOutputFormat) {
  if (format === "jpeg") {
    return "JPG";
  }

  if (format === "webp") {
    return "WebP";
  }

  return "PNG";
}

export function getImageMimeLabel(mimeType: string) {
  if (mimeType === "image/jpeg") {
    return "JPG";
  }

  if (mimeType === "image/webp") {
    return "WebP";
  }

  if (mimeType === "image/png") {
    return "PNG";
  }

  return mimeType || "Desconocido";
}

export function getImageOutputBaseName(fileName: string) {
  return getImageDownloadBaseName(fileName, defaultOutputBaseName);
}

export function buildConvertedImageFileName(
  baseName: string,
  outputFormat: ImageConverterOutputFormat,
  fallbackBaseName = defaultOutputBaseName,
) {
  return buildBrowserImageDownloadFileName(baseName, outputFormat, fallbackBaseName);
}

export async function readImageMetadata(file: File): Promise<ImageConverterMetadata> {
  const mimeType = getBrowserImageMimeType(file);

  if (!mimeType) {
    throw new Error("Seleccioná una imagen PNG, JPG o WebP válida.");
  }

  try {
    const image = await loadBrowserImage(file, "No se pudo decodificar la imagen en este navegador.");

    if (image.naturalWidth <= 0 || image.naturalHeight <= 0) {
      throw new Error("La imagen no tiene dimensiones válidas.");
    }

    return {
      fileName: file.name,
      fileSize: file.size,
      height: image.naturalHeight,
      mimeType,
      width: image.naturalWidth,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("No se pudo leer la imagen.");
  }
}

function ensureOutputFormatSupported(outputFormat: ImageConverterOutputFormat) {
  if (!canExportBrowserImageFormat(outputFormat)) {
    throw new Error(`Este navegador no permite exportar imágenes como ${getImageFormatLabel(outputFormat)}.`);
  }
}

export async function convertImageFile(
  file: File,
  { outputBaseName, outputFormat, quality }: ConvertImageOptions,
): Promise<ImageConverterResult> {
  if (!isConvertibleImageFile(file)) {
    throw new Error("Seleccioná una imagen PNG, JPG o WebP válida.");
  }

  ensureOutputFormatSupported(outputFormat);

  const mimeType = getBrowserImageOutputMimeType(outputFormat);
  const converted = await exportBrowserImageFile(file, {
    backgroundColor: outputFormat === "jpeg" ? "#ffffff" : undefined,
    errorMessage: "No se pudo decodificar la imagen en este navegador.",
    mimeType,
    quality,
  });

  if (converted.mimeType !== mimeType) {
    throw new Error(`El navegador no exportó la imagen como ${getImageFormatLabel(outputFormat)}.`);
  }

  return {
    bytes: converted.bytes,
    fileName: buildConvertedImageFileName(outputBaseName, outputFormat, getImageOutputBaseName(file.name)),
    format: outputFormat,
    height: converted.height,
    mimeType,
    size: converted.size,
    width: converted.width,
  };
}
