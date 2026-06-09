import { ToolError } from "../../../shared/errors/ToolError";
import type { PageSelectionError } from "@modulaq/core/ranges";
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

export function validateImageDimensions({
  height,
  width,
}: ImageDimensions): PageSelectionError | null {
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return { code: "tools.errors.dimensionsNotNumeric" };
  }

  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    return { code: "tools.errors.dimensionsNotInteger" };
  }

  if (width <= 0 || height <= 0) {
    return { code: "tools.errors.dimensionsNotPositive" };
  }

  if (width > maxImageDimension || height > maxImageDimension) {
    return { code: "tools.errors.dimensionsExceedMax", vars: { max: maxImageDimension } };
  }

  if (width * height > maxImagePixels) {
    return { code: "tools.errors.dimensionsExceedPixels" };
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

function ensureOutputFormatSupported(outputFormat: ImageResizerOutputFormat) {
  if (!canExportBrowserImageFormat(outputFormat)) {
    throw new ToolError("tools.errors.unsupportedOutputFormat", {
      format: getImageFormatLabel(outputFormat),
    });
  }
}

export async function resizeImageFile(
  file: File,
  { height, outputBaseName, outputFormat, quality, width }: ResizeImageOptions,
): Promise<ImageResizerResult> {
  if (!isResizableImageFile(file)) {
    throw new ToolError("tools.errors.invalidImage");
  }

  const dimensionsError = validateImageDimensions({ width, height });

  if (dimensionsError) {
    throw new ToolError(dimensionsError.code, dimensionsError.vars);
  }

  ensureOutputFormatSupported(outputFormat);

  const mimeType = getBrowserImageOutputMimeType(outputFormat);
  const resized = await exportBrowserImageFile(file, {
    backgroundColor: outputFormat === "jpeg" ? "#ffffff" : undefined,
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
