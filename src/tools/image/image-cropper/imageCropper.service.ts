import { ToolError } from "../../../shared/errors/ToolError";
import type { PageSelectionError } from "@modulaq/core/ranges";
import { formatFileSize } from "../../../shared/utils/file";
import {
  buildBrowserImageDownloadFileName,
  canExportBrowserImageFormat,
  exportBrowserCanvas,
  getBrowserImageMimeType,
  getBrowserImageOutputMimeType,
  getImageDownloadBaseName,
  isBrowserImageFile,
  loadBrowserImage,
} from "../../../shared/utils/imageFiles";
import type {
  CropImageOptions,
  ImageCropperMetadata,
  ImageCropperOutputFormat,
  ImageCropperResult,
  ImageCropRect,
  ImageDimensions,
} from "./imageCropper.types";

export const defaultOutputBaseName = "imagen-recortada";
export const maxCropPixels = 64_000_000;

export { formatFileSize };

export function isCroppableImageFile(file: File) {
  return isBrowserImageFile(file);
}

export function getImageFormatLabel(format: ImageCropperOutputFormat) {
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

export function getCroppedImageOutputBaseName(fileName: string) {
  const baseName = getImageDownloadBaseName(fileName, defaultOutputBaseName);
  return `${baseName}-recortada`;
}

export function buildCroppedImageFileName(
  baseName: string,
  outputFormat: ImageCropperOutputFormat,
  fallbackBaseName = defaultOutputBaseName,
) {
  return buildBrowserImageDownloadFileName(baseName, outputFormat, fallbackBaseName);
}

export function getCropOutputDimensions(cropRect: ImageCropRect): ImageDimensions {
  return {
    height: cropRect.height,
    width: cropRect.width,
  };
}

function hasOnlyFiniteNumbers(cropRect: ImageCropRect) {
  return [cropRect.x, cropRect.y, cropRect.width, cropRect.height].every(Number.isFinite);
}

function hasOnlyIntegers(cropRect: ImageCropRect) {
  return [cropRect.x, cropRect.y, cropRect.width, cropRect.height].every(Number.isInteger);
}

export function validateCropRect(
  cropRect: ImageCropRect,
  imageDimensions: ImageDimensions,
): PageSelectionError | null {
  if (!hasOnlyFiniteNumbers(cropRect)) {
    return { code: "tools.errors.cropNotNumeric" };
  }

  if (!hasOnlyIntegers(cropRect)) {
    return { code: "tools.errors.cropNotInteger" };
  }

  if (cropRect.x < 0 || cropRect.y < 0) {
    return { code: "tools.errors.cropNegativeOrigin" };
  }

  if (cropRect.width <= 0 || cropRect.height <= 0) {
    return { code: "tools.errors.cropNotPositive" };
  }

  if (cropRect.x + cropRect.width > imageDimensions.width || cropRect.y + cropRect.height > imageDimensions.height) {
    return { code: "tools.errors.cropExceedsImage" };
  }

  if (cropRect.width * cropRect.height > maxCropPixels) {
    return { code: "tools.errors.cropExceedsPixels" };
  }

  return null;
}

export function createFullImageCropRect(imageDimensions: ImageDimensions): ImageCropRect {
  return {
    height: imageDimensions.height,
    width: imageDimensions.width,
    x: 0,
    y: 0,
  };
}

export function createCenteredCropRect(
  imageDimensions: ImageDimensions,
  cropDimensions: ImageDimensions,
): ImageCropRect {
  const width = Math.min(Math.max(1, Math.round(cropDimensions.width)), imageDimensions.width);
  const height = Math.min(Math.max(1, Math.round(cropDimensions.height)), imageDimensions.height);

  return {
    height,
    width,
    x: Math.floor((imageDimensions.width - width) / 2),
    y: Math.floor((imageDimensions.height - height) / 2),
  };
}

export function createCenteredSquareCropRect(imageDimensions: ImageDimensions): ImageCropRect {
  const side = Math.min(imageDimensions.width, imageDimensions.height);
  return createCenteredCropRect(imageDimensions, { height: side, width: side });
}

export async function readImageMetadata(file: File): Promise<ImageCropperMetadata> {
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

function ensureOutputFormatSupported(outputFormat: ImageCropperOutputFormat) {
  if (!canExportBrowserImageFormat(outputFormat)) {
    throw new ToolError("tools.errors.unsupportedOutputFormat", {
      format: getImageFormatLabel(outputFormat),
    });
  }
}

function drawCroppedImage(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  cropRect: ImageCropRect,
  outputFormat: ImageCropperOutputFormat,
) {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new ToolError("tools.errors.imageOutputFailed");
  }

  if (outputFormat === "jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(
    image,
    cropRect.x,
    cropRect.y,
    cropRect.width,
    cropRect.height,
    0,
    0,
    cropRect.width,
    cropRect.height,
  );
}

export async function cropImageFile(
  file: File,
  { cropRect, outputBaseName, outputFormat, quality }: CropImageOptions,
): Promise<ImageCropperResult> {
  if (!isCroppableImageFile(file)) {
    throw new ToolError("tools.errors.invalidImage");
  }

  ensureOutputFormatSupported(outputFormat);

  const image = await loadBrowserImage(file);
  const validationError = validateCropRect(cropRect, {
    height: image.naturalHeight,
    width: image.naturalWidth,
  });

  if (validationError) {
    throw new ToolError(validationError.code, validationError.vars);
  }

  const canvas = document.createElement("canvas");
  canvas.width = cropRect.width;
  canvas.height = cropRect.height;
  drawCroppedImage(canvas, image, cropRect, outputFormat);

  const mimeType = getBrowserImageOutputMimeType(outputFormat);
  const result = await exportBrowserCanvas(canvas, {
    canvasError: new ToolError("tools.errors.imageExportFailed"),
    mimeType,
    quality,
  });

  return {
    bytes: result.bytes,
    fileName: buildCroppedImageFileName(outputBaseName, outputFormat, getCroppedImageOutputBaseName(file.name)),
    format: outputFormat,
    height: result.height,
    mimeType,
    size: result.size,
    width: result.width,
  };
}
