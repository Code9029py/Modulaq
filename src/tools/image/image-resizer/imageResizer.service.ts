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
  ImageDimensions,
  ImageResizeMode,
  ImageResizerMetadata,
  ImageResizerOutputFormat,
  ImageResizerResult,
  ResizeImageOptions,
} from "./imageResizer.types";

export const defaultOutputBaseName = "imagen-redimensionada";
export const maxImageDimension = 8000;
export const maxImagePixels = 64_000_000;

export { formatFileSize };

export function isResizableImageFile(file: File) {
  return isBrowserImageFile(file);
}

export function getImageFormatLabel(format: ImageResizerOutputFormat) {
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

export function getResizedImageOutputBaseName(fileName: string) {
  const baseName = getImageDownloadBaseName(fileName, defaultOutputBaseName);
  return `${baseName}-redimensionada`;
}

export function buildResizedImageFileName(
  baseName: string,
  outputFormat: ImageResizerOutputFormat,
  fallbackBaseName = defaultOutputBaseName,
) {
  return buildBrowserImageDownloadFileName(baseName, outputFormat, fallbackBaseName);
}

export function validateImageDimensions({ height, width }: ImageDimensions) {
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return "Usá dimensiones numéricas válidas.";
  }

  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    return "Usá dimensiones enteras en píxeles.";
  }

  if (width <= 0 || height <= 0) {
    return "El ancho y el alto deben ser mayores que cero.";
  }

  if (width > maxImageDimension || height > maxImageDimension) {
    return `El ancho y el alto no pueden superar ${maxImageDimension}px.`;
  }

  if (width * height > maxImagePixels) {
    return "La imagen resultante supera el límite de 64 megapíxeles.";
  }

  return null;
}

export function calculateResizeDimensions(
  original: ImageDimensions,
  mode: ImageResizeMode,
  value: number,
  maintainAspectRatio: boolean,
  customHeight?: number,
): ImageDimensions {
  if (mode === "scale") {
    const scale = value / 100;
    return {
      width: Math.max(1, Math.round(original.width * scale)),
      height: Math.max(1, Math.round(original.height * scale)),
    };
  }

  if (mode === "width" && maintainAspectRatio) {
    return {
      width: Math.round(value),
      height: Math.max(1, Math.round((value / original.width) * original.height)),
    };
  }

  if (mode === "height" && maintainAspectRatio) {
    return {
      width: Math.max(1, Math.round((value / original.height) * original.width)),
      height: Math.round(value),
    };
  }

  return {
    width: Math.round(value),
    height: Math.round(customHeight ?? original.height),
  };
}

export function calculateSizeDelta(originalSize: number, finalSize: number) {
  const deltaBytes = finalSize - originalSize;
  const deltaPercent = originalSize > 0 ? (deltaBytes / originalSize) * 100 : 0;

  return {
    deltaBytes,
    deltaPercent,
  };
}

export async function readImageMetadata(file: File): Promise<ImageResizerMetadata> {
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

function ensureOutputFormatSupported(outputFormat: ImageResizerOutputFormat) {
  if (!canExportBrowserImageFormat(outputFormat)) {
    throw new Error(`Este navegador no permite exportar imágenes como ${getImageFormatLabel(outputFormat)}.`);
  }
}

export async function resizeImageFile(
  file: File,
  { height, outputBaseName, outputFormat, quality, width }: ResizeImageOptions,
): Promise<ImageResizerResult> {
  if (!isResizableImageFile(file)) {
    throw new Error("Seleccioná una imagen PNG, JPG o WebP válida.");
  }

  const dimensionsError = validateImageDimensions({ width, height });

  if (dimensionsError) {
    throw new Error(dimensionsError);
  }

  ensureOutputFormatSupported(outputFormat);

  const mimeType = getBrowserImageOutputMimeType(outputFormat);
  const resized = await exportBrowserImageFile(file, {
    backgroundColor: outputFormat === "jpeg" ? "#ffffff" : undefined,
    errorMessage: "No se pudo decodificar la imagen en este navegador.",
    height,
    mimeType,
    quality,
    width,
  });
  const sizeDelta = calculateSizeDelta(file.size, resized.size);

  return {
    bytes: resized.bytes,
    fileName: buildResizedImageFileName(outputBaseName, outputFormat, getResizedImageOutputBaseName(file.name)),
    format: outputFormat,
    height: resized.height,
    mimeType,
    size: resized.size,
    sizeDeltaBytes: sizeDelta.deltaBytes,
    sizeDeltaPercent: sizeDelta.deltaPercent,
    width: resized.width,
  };
}
