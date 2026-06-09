import { ToolError } from "../../../shared/errors/ToolError";
import type { PageSelectionError } from "@modulaq/core/ranges";
import { formatFileSize } from "../../../shared/utils/file";
import {
  buildBrowserImageDownloadFileName,
  canExportBrowserImageFormat,
  exportBrowserCanvas,
  getBrowserImageOutputMimeType,
} from "../../../shared/utils/imageFiles";
import type {
  ImagePlaceholderOptions,
  ImagePlaceholderOutputFormat,
  ImagePlaceholderResult,
} from "./imagePlaceholder.types";

export const defaultPlaceholderWidth = 800;
export const defaultPlaceholderHeight = 400;
export const defaultBackgroundColor = "#E5E7EB";
export const defaultTextColor = "#374151";
export const maxPlaceholderSide = 8000;
export const maxPlaceholderPixels = 64_000_000;

export { formatFileSize };

export function getDefaultPlaceholderText(width: number, height: number) {
  return `${width} x ${height}`;
}

export function getPlaceholderOutputBaseName(width: number, height: number) {
  return `placeholder-${width}x${height}`;
}

export function buildPlaceholderFileName(
  baseName: string,
  outputFormat: ImagePlaceholderOutputFormat,
  fallbackBaseName = getPlaceholderOutputBaseName(defaultPlaceholderWidth, defaultPlaceholderHeight),
) {
  return buildBrowserImageDownloadFileName(baseName, outputFormat, fallbackBaseName);
}

export function getImageFormatLabel(format: ImagePlaceholderOutputFormat) {
  if (format === "jpeg") {
    return "JPG";
  }

  if (format === "webp") {
    return "WebP";
  }

  return "PNG";
}

export function normalizeHexColor(value: string, fallback: string) {
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

export function validatePlaceholderDimensions(
  width: number,
  height: number,
): PageSelectionError | null {
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return { code: "tools.errors.dimensionsNotNumeric" };
  }

  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    return { code: "tools.errors.dimensionsNotInteger" };
  }

  if (width <= 0 || height <= 0) {
    return { code: "tools.errors.dimensionsNotPositive" };
  }

  if (width > maxPlaceholderSide || height > maxPlaceholderSide) {
    return { code: "tools.errors.dimensionsExceedMax", vars: { max: maxPlaceholderSide } };
  }

  if (width * height > maxPlaceholderPixels) {
    return { code: "tools.errors.placeholderPixelLimit" };
  }

  return null;
}

export function validatePlaceholderOptions({
  backgroundColor,
  height,
  textColor,
  width,
}: ImagePlaceholderOptions): PageSelectionError | null {
  const dimensionError = validatePlaceholderDimensions(width, height);
  if (dimensionError) return dimensionError;

  if (normalizeHexColor(backgroundColor, "") === "") {
    return { code: "tools.errors.placeholderInvalidBgColor" };
  }

  if (normalizeHexColor(textColor, "") === "") {
    return { code: "tools.errors.placeholderInvalidTextColor" };
  }

  return null;
}

function fitFontSize(context: CanvasRenderingContext2D, text: string, width: number, height: number) {
  if (!text.trim()) {
    return 0;
  }

  const maxFontSize = Math.max(12, Math.floor(Math.min(width, height) / 5));
  const minFontSize = 10;
  const maxTextWidth = Math.max(1, width * 0.82);

  for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= 1) {
    context.font = `700 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    if (context.measureText(text).width <= maxTextWidth) {
      return fontSize;
    }
  }

  return minFontSize;
}

function drawPlaceholder(canvas: HTMLCanvasElement, options: ImagePlaceholderOptions) {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new ToolError("tools.errors.placeholderPrepareFailed");
  }

  const backgroundColor = normalizeHexColor(options.backgroundColor, defaultBackgroundColor);
  const textColor = normalizeHexColor(options.textColor, defaultTextColor);
  canvas.width = options.width;
  canvas.height = options.height;

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const text = options.text.trim();
  if (!text) return;

  const fontSize = fitFontSize(context, text, canvas.width, canvas.height);
  context.font = `700 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  context.fillStyle = textColor;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);
}

export async function generatePlaceholderImage(options: ImagePlaceholderOptions): Promise<ImagePlaceholderResult> {
  const validationError = validatePlaceholderOptions(options);
  if (validationError) {
    throw new ToolError(validationError.code, validationError.vars);
  }

  if (!canExportBrowserImageFormat(options.outputFormat)) {
    throw new ToolError("tools.errors.unsupportedOutputFormat", {
      format: getImageFormatLabel(options.outputFormat),
    });
  }

  const canvas = document.createElement("canvas");
  drawPlaceholder(canvas, options);

  const mimeType = getBrowserImageOutputMimeType(options.outputFormat);
  const result = await exportBrowserCanvas(canvas, {
    canvasError: new ToolError("tools.errors.placeholderGenerationFailed"),
    mimeType,
    quality: options.quality,
  });

  return {
    bytes: result.bytes,
    fileName: buildPlaceholderFileName(
      options.outputBaseName,
      options.outputFormat,
      getPlaceholderOutputBaseName(options.width, options.height),
    ),
    format: options.outputFormat,
    height: result.height,
    mimeType,
    size: result.size,
    width: result.width,
  };
}
