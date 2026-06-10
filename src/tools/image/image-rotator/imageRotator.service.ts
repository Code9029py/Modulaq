import { ToolError } from "../../../shared/errors/ToolError";
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
  ImageDimensions,
  ImageRotatorAction,
  ImageRotatorMetadata,
  ImageRotatorOutputFormat,
  ImageRotatorResult,
  ImageRotatorTransform,
  RotateImageOptions,
} from "./imageRotator.types";

export const defaultOutputBaseName = "imagen-rotada";
export const defaultTransform: ImageRotatorTransform = {
  flipHorizontal: false,
  flipVertical: false,
  rotation: 0,
};

const validActions: readonly ImageRotatorAction[] = [
  "rotate-right",
  "rotate-left",
  "rotate-180",
  "flip-horizontal",
  "flip-vertical",
];

export { formatFileSize };

export function isRotatableImageFile(file: File) {
  return isBrowserImageFile(file);
}

export function getImageFormatLabel(format: ImageRotatorOutputFormat) {
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

export function isImageRotatorAction(action: string): action is ImageRotatorAction {
  return validActions.includes(action as ImageRotatorAction);
}

function normalizeRotation(rotation: number): ImageRotatorTransform["rotation"] {
  const normalized = ((rotation % 360) + 360) % 360;

  if (normalized === 90 || normalized === 180 || normalized === 270) {
    return normalized;
  }

  return 0;
}

export function applyImageRotatorAction(
  transform: ImageRotatorTransform,
  action: ImageRotatorAction,
): ImageRotatorTransform {
  if (action === "rotate-right") {
    return { ...transform, rotation: normalizeRotation(transform.rotation + 90) };
  }

  if (action === "rotate-left") {
    return { ...transform, rotation: normalizeRotation(transform.rotation - 90) };
  }

  if (action === "rotate-180") {
    return { ...transform, rotation: normalizeRotation(transform.rotation + 180) };
  }

  if (action === "flip-horizontal") {
    return { ...transform, flipHorizontal: !transform.flipHorizontal };
  }

  return { ...transform, flipVertical: !transform.flipVertical };
}

export function getTransformedImageDimensions(
  dimensions: ImageDimensions,
  transform: ImageRotatorTransform,
): ImageDimensions {
  if (transform.rotation === 90 || transform.rotation === 270) {
    return {
      height: dimensions.width,
      width: dimensions.height,
    };
  }

  return dimensions;
}

export function hasImageTransform(transform: ImageRotatorTransform) {
  return transform.rotation !== 0 || transform.flipHorizontal || transform.flipVertical;
}

export function getRotatedImageOutputBaseName(fileName: string) {
  const baseName = getImageDownloadBaseName(fileName, defaultOutputBaseName);
  return `${baseName}-rotada`;
}

export function buildRotatedImageFileName(
  baseName: string,
  outputFormat: ImageRotatorOutputFormat,
  fallbackBaseName = defaultOutputBaseName,
) {
  return buildBrowserImageDownloadFileName(baseName, outputFormat, fallbackBaseName);
}

export async function readImageMetadata(file: File): Promise<ImageRotatorMetadata> {
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

function ensureOutputFormatSupported(outputFormat: ImageRotatorOutputFormat) {
  if (!canExportBrowserImageFormat(outputFormat)) {
    throw new ToolError("tools.errors.unsupportedOutputFormat", {
      format: getImageFormatLabel(outputFormat),
    });
  }
}

function drawTransformedImage(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  transform: ImageRotatorTransform,
  outputFormat: ImageRotatorOutputFormat,
) {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new ToolError("tools.errors.imageOutputFailed");
  }

  if (outputFormat === "jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.save();
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((transform.rotation * Math.PI) / 180);
  context.scale(transform.flipHorizontal ? -1 : 1, transform.flipVertical ? -1 : 1);
  context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  context.restore();
}

export async function rotateImageFile(
  file: File,
  { outputBaseName, outputFormat, quality, transform }: RotateImageOptions,
): Promise<ImageRotatorResult> {
  if (!isRotatableImageFile(file)) {
    throw new ToolError("tools.errors.invalidImage");
  }

  ensureOutputFormatSupported(outputFormat);

  const image = await loadBrowserImage(file);
  const outputDimensions = getTransformedImageDimensions(
    { height: image.naturalHeight, width: image.naturalWidth },
    transform,
  );
  const canvas = document.createElement("canvas");
  canvas.width = outputDimensions.width;
  canvas.height = outputDimensions.height;
  drawTransformedImage(canvas, image, transform, outputFormat);

  const mimeType = getBrowserImageOutputMimeType(outputFormat);
  const result = await exportBrowserCanvas(canvas, {
    canvasError: new ToolError("tools.errors.imageExportFailed"),
    mimeType,
    quality,
  });

  return {
    bytes: result.bytes,
    fileName: buildRotatedImageFileName(outputBaseName, outputFormat, getRotatedImageOutputBaseName(file.name)),
    format: outputFormat,
    height: result.height,
    mimeType,
    size: result.size,
    width: result.width,
  };
}
