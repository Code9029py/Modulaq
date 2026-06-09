import { ToolError } from "../../../shared/errors/ToolError";
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
  CompressImageOptions,
  ImageCompressorMetadata,
  ImageCompressorOutputFormat,
  ImageCompressorResult,
  ImageSizeChange,
} from "./imageCompressor.types";

export const defaultOutputBaseName = "imagen-comprimida";
export const defaultCompressionQuality = 0.85;

export { formatFileSize };

export function isCompressibleImageFile(file: File) {
  return isBrowserImageFile(file);
}

export function getImageFormatLabel(format: ImageCompressorOutputFormat) {
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

export function getCompressedImageOutputBaseName(fileName: string) {
  const baseName = getImageDownloadBaseName(fileName, defaultOutputBaseName);
  return `${baseName}-comprimida`;
}

export function buildCompressedImageFileName(
  baseName: string,
  outputFormat: ImageCompressorOutputFormat,
  fallbackBaseName = defaultOutputBaseName,
) {
  return buildBrowserImageDownloadFileName(baseName, outputFormat, fallbackBaseName);
}

export function calculateImageSizeChange(originalSize: number, finalSize: number): ImageSizeChange {
  const deltaBytes = originalSize - finalSize;

  if (originalSize <= 0 || deltaBytes === 0) {
    return {
      deltaBytes,
      direction: deltaBytes < 0 ? "increase" : deltaBytes > 0 ? "reduction" : "same",
      percentage: 0,
    };
  }

  return {
    deltaBytes,
    direction: deltaBytes > 0 ? "reduction" : "increase",
    percentage: Math.abs(deltaBytes / originalSize) * 100,
  };
}

export function formatImageSizeChange(sizeChange: ImageSizeChange) {
  const absoluteDelta = Math.abs(sizeChange.deltaBytes);
  const formattedDelta = formatFileSize(absoluteDelta);
  const formattedPercentage = `${sizeChange.percentage.toFixed(1)}%`;

  if (sizeChange.direction === "reduction") {
    return `Reducción de ${formattedDelta} (${formattedPercentage}).`;
  }

  if (sizeChange.direction === "increase") {
    return `Aumento de ${formattedDelta} (${formattedPercentage}).`;
  }

  return "El tamaño quedó igual.";
}

export async function readImageMetadata(file: File): Promise<ImageCompressorMetadata> {
  const mimeType = getBrowserImageMimeType(file);

  if (!mimeType) {
    throw new ToolError("tools.errors.invalidImage");
  }

  try {
    const image = await loadBrowserImage(file);

    if (image.naturalWidth <= 0 || image.naturalHeight <= 0) {
      throw new ToolError("tools.errors.imageNoDimensions");
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

    throw new ToolError("tools.errors.imageLoadFailed");
  }
}

function ensureOutputFormatSupported(outputFormat: ImageCompressorOutputFormat) {
  if (!canExportBrowserImageFormat(outputFormat)) {
    throw new ToolError("tools.errors.unsupportedOutputFormat", {
      format: getImageFormatLabel(outputFormat),
    });
  }
}

export async function compressImageFile(
  file: File,
  { outputBaseName, outputFormat, quality = defaultCompressionQuality }: CompressImageOptions,
): Promise<ImageCompressorResult> {
  if (!isCompressibleImageFile(file)) {
    throw new ToolError("tools.errors.invalidImage");
  }

  ensureOutputFormatSupported(outputFormat);

  const mimeType = getBrowserImageOutputMimeType(outputFormat);
  const compressed = await exportBrowserImageFile(file, {
    backgroundColor: outputFormat === "jpeg" ? "#ffffff" : undefined,
    mimeType,
    quality,
  });

  if (compressed.mimeType !== mimeType) {
    throw new ToolError("tools.errors.canvasExportFailed", {
      format: getImageFormatLabel(outputFormat),
    });
  }

  return {
    bytes: compressed.bytes,
    fileName: buildCompressedImageFileName(outputBaseName, outputFormat, getCompressedImageOutputBaseName(file.name)),
    format: outputFormat,
    height: compressed.height,
    mimeType,
    size: compressed.size,
    sizeChange: calculateImageSizeChange(file.size, compressed.size),
    width: compressed.width,
  };
}
