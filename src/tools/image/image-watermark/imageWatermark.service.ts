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
  ImageDimensions,
  ImageWatermarkMetadata,
  ImageWatermarkOptions,
  ImageWatermarkOutputFormat,
  ImageWatermarkPosition,
  ImageWatermarkResult,
  TextBoxDimensions,
} from "./imageWatermark.types";

export const defaultOutputBaseName = "imagen-marca-agua";
export const defaultWatermarkText = "Modulaq";
export const defaultWatermarkColor = "#FFFFFF";
export const defaultWatermarkOpacity = 0.65;
export const defaultWatermarkFontSize = 48;
export const defaultWatermarkMargin = 32;
export const defaultWatermarkLogoMaxWidthPercent = 22;
export const minWatermarkFontSize = 8;
export const maxWatermarkFontSize = 512;
export const maxWatermarkMargin = 10_000;
export const minWatermarkLogoMaxWidthPercent = 1;
export const maxWatermarkLogoMaxWidthPercent = 100;

export { formatFileSize };

export function isWatermarkableImageFile(file: File) {
  return isBrowserImageFile(file);
}

export function isWatermarkLogoFile(file: File) {
  return getBrowserImageMimeType(file) !== null;
}

export function getImageFormatLabel(format: ImageWatermarkOutputFormat) {
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

export function getWatermarkedImageOutputBaseName(fileName: string) {
  const baseName = getImageDownloadBaseName(fileName, defaultOutputBaseName);
  return `${baseName}-marca-agua`;
}

export function buildWatermarkedImageFileName(
  baseName: string,
  outputFormat: ImageWatermarkOutputFormat,
  fallbackBaseName = defaultOutputBaseName,
) {
  return buildBrowserImageDownloadFileName(baseName, outputFormat, fallbackBaseName);
}

export function normalizeHexColor(value: string, fallback = defaultWatermarkColor) {
  const trimmedValue = value.trim();
  const shortMatch = trimmedValue.match(/^#?([0-9a-f]{3})$/i);

  if (shortMatch) {
    return `#${shortMatch[1]
      .split("")
      .map((character) => `${character}${character}`)
      .join("")
      .toUpperCase()}`;
  }

  const fullMatch = trimmedValue.match(/^#?([0-9a-f]{6})$/i);
  if (fullMatch) {
    return `#${fullMatch[1].toUpperCase()}`;
  }

  return fallback;
}

export function validateWatermarkOpacity(opacity: number): PageSelectionError | null {
  if (!Number.isFinite(opacity)) return { code: "tools.errors.watermarkOpacityNotNumber" };
  if (opacity < 0.1 || opacity > 1) return { code: "tools.errors.watermarkOpacityRange" };
  return null;
}

export function validateWatermarkFontSize(fontSize: number): PageSelectionError | null {
  if (!Number.isFinite(fontSize)) return { code: "tools.errors.watermarkFontSizeNotNumber" };
  if (!Number.isInteger(fontSize)) return { code: "tools.errors.watermarkFontSizeNotInteger" };
  if (fontSize < minWatermarkFontSize || fontSize > maxWatermarkFontSize) {
    return {
      code: "tools.errors.watermarkFontSizeRange",
      vars: { min: minWatermarkFontSize, max: maxWatermarkFontSize },
    };
  }
  return null;
}

export function validateWatermarkLogoMaxWidthPercent(
  maxWidthPercent: number,
): PageSelectionError | null {
  if (!Number.isFinite(maxWidthPercent)) return { code: "tools.errors.watermarkLogoSizeNotNumber" };
  if (!Number.isInteger(maxWidthPercent)) return { code: "tools.errors.watermarkLogoSizeNotInteger" };
  if (
    maxWidthPercent < minWatermarkLogoMaxWidthPercent ||
    maxWidthPercent > maxWatermarkLogoMaxWidthPercent
  ) {
    return {
      code: "tools.errors.watermarkLogoSizeRange",
      vars: { min: minWatermarkLogoMaxWidthPercent, max: maxWatermarkLogoMaxWidthPercent },
    };
  }
  return null;
}

export function validateWatermarkMargin(margin: number): PageSelectionError | null {
  if (!Number.isFinite(margin)) return { code: "tools.errors.watermarkMarginNotNumber" };
  if (!Number.isInteger(margin)) return { code: "tools.errors.watermarkMarginNotInteger" };
  if (margin < 0 || margin > maxWatermarkMargin) return { code: "tools.errors.watermarkMarginRange" };
  return null;
}

export function validateWatermarkOptions(options: ImageWatermarkOptions): PageSelectionError | null {
  const opacityError = validateWatermarkOpacity(options.opacity);
  if (opacityError) return opacityError;

  const marginError = validateWatermarkMargin(options.margin);
  if (marginError) return marginError;

  if (options.kind === "image") {
    if (!isWatermarkLogoFile(options.logoFile)) {
      return { code: "tools.errors.watermarkLogoInvalidFile" };
    }

    return validateWatermarkLogoMaxWidthPercent(options.logoMaxWidthPercent);
  }

  if (!options.text.trim()) {
    return { code: "tools.errors.watermarkEmptyText" };
  }

  const fontSizeError = validateWatermarkFontSize(options.fontSize);
  if (fontSizeError) return fontSizeError;

  if (normalizeHexColor(options.color, "") === "") {
    return { code: "tools.errors.watermarkInvalidColor" };
  }

  return null;
}

export function calculateWatermarkPosition(
  imageDimensions: ImageDimensions,
  watermarkDimensions: TextBoxDimensions,
  position: ImageWatermarkPosition,
  margin: number,
) {
  const centerX = Math.round((imageDimensions.width - watermarkDimensions.width) / 2);
  const centerY = Math.round((imageDimensions.height - watermarkDimensions.height) / 2);

  if (position === "top-left") {
    return { x: margin, y: margin };
  }

  if (position === "top-right") {
    return { x: imageDimensions.width - watermarkDimensions.width - margin, y: margin };
  }

  if (position === "bottom-left") {
    return { x: margin, y: imageDimensions.height - watermarkDimensions.height - margin };
  }

  if (position === "bottom-right") {
    return {
      x: imageDimensions.width - watermarkDimensions.width - margin,
      y: imageDimensions.height - watermarkDimensions.height - margin,
    };
  }

  return { x: centerX, y: centerY };
}

export function calculateLogoWatermarkDimensions(
  imageDimensions: ImageDimensions,
  logoDimensions: ImageDimensions,
  maxWidthPercent: number,
) {
  const targetWidth = Math.max(1, Math.round((imageDimensions.width * maxWidthPercent) / 100));
  const widthScale = targetWidth / logoDimensions.width;
  const heightScale = imageDimensions.height / logoDimensions.height;
  const scale = Math.min(widthScale, heightScale);

  return {
    height: Math.max(1, Math.round(logoDimensions.height * scale)),
    width: Math.max(1, Math.round(logoDimensions.width * scale)),
  };
}

export async function readImageMetadata(file: File): Promise<ImageWatermarkMetadata> {
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

function configureWatermarkFont(context: CanvasRenderingContext2D, fontSize: number) {
  context.font = `700 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
}

function measureWatermarkText(context: CanvasRenderingContext2D, text: string, fontSize: number): TextBoxDimensions {
  configureWatermarkFont(context, fontSize);
  const metrics = context.measureText(text);
  return {
    height: Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) || fontSize,
    width: Math.ceil(metrics.width),
  };
}

export async function addImageWatermark(file: File, options: ImageWatermarkOptions): Promise<ImageWatermarkResult> {
  if (!isWatermarkableImageFile(file)) {
    throw new ToolError("tools.errors.invalidImage");
  }

  const validationError = validateWatermarkOptions(options);
  if (validationError) {
    throw new ToolError(validationError.code, validationError.vars);
  }

  if (!canExportBrowserImageFormat(options.outputFormat)) {
    throw new ToolError("tools.errors.unsupportedOutputFormat", {
      format: getImageFormatLabel(options.outputFormat),
    });
  }

  const image = await loadBrowserImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new ToolError("tools.errors.watermarkOutputFailed");
  }

  if (options.outputFormat === "jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(image, 0, 0);
  context.save();
  context.globalAlpha = options.opacity;

  if (options.kind === "image") {
    const logo = await loadBrowserImage(options.logoFile, new ToolError("tools.errors.watermarkLogoInvalid"));
    const logoDimensions = calculateLogoWatermarkDimensions(
      { height: canvas.height, width: canvas.width },
      { height: logo.naturalHeight, width: logo.naturalWidth },
      options.logoMaxWidthPercent,
    );
    const coordinates = calculateWatermarkPosition(
      { height: canvas.height, width: canvas.width },
      logoDimensions,
      options.position,
      options.margin,
    );

    context.drawImage(logo, coordinates.x, coordinates.y, logoDimensions.width, logoDimensions.height);
  } else {
    const textDimensions = measureWatermarkText(context, options.text, options.fontSize);
    const coordinates = calculateWatermarkPosition(
      { height: canvas.height, width: canvas.width },
      textDimensions,
      options.position,
      options.margin,
    );

    configureWatermarkFont(context, options.fontSize);
    context.fillStyle = normalizeHexColor(options.color);
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillText(options.text, coordinates.x, coordinates.y);
  }

  context.restore();

  const mimeType = getBrowserImageOutputMimeType(options.outputFormat);
  const result = await exportBrowserCanvas(canvas, {
    canvasError: new ToolError("tools.errors.watermarkFailed"),
    mimeType,
    quality: options.quality,
  });

  return {
    bytes: result.bytes,
    fileName: buildWatermarkedImageFileName(
      options.outputBaseName,
      options.outputFormat,
      getWatermarkedImageOutputBaseName(file.name),
    ),
    format: options.outputFormat,
    height: result.height,
    mimeType,
    size: result.size,
    width: result.width,
  };
}
