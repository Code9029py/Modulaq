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
export const minWatermarkFontSize = 8;
export const maxWatermarkFontSize = 512;
export const maxWatermarkMargin = 10_000;

export { formatFileSize };

export function isWatermarkableImageFile(file: File) {
  return isBrowserImageFile(file);
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

export function validateWatermarkOpacity(opacity: number) {
  if (!Number.isFinite(opacity)) {
    return "La opacidad debe ser un numero valido.";
  }

  if (opacity < 0.1 || opacity > 1) {
    return "La opacidad debe estar entre 10% y 100%.";
  }

  return null;
}

export function validateWatermarkFontSize(fontSize: number) {
  if (!Number.isFinite(fontSize)) {
    return "El tamano de fuente debe ser un numero valido.";
  }

  if (!Number.isInteger(fontSize)) {
    return "El tamano de fuente debe ser un numero entero.";
  }

  if (fontSize < minWatermarkFontSize || fontSize > maxWatermarkFontSize) {
    return `El tamano de fuente debe estar entre ${minWatermarkFontSize} y ${maxWatermarkFontSize}px.`;
  }

  return null;
}

export function validateWatermarkMargin(margin: number) {
  if (!Number.isFinite(margin)) {
    return "El margen debe ser un numero valido.";
  }

  if (!Number.isInteger(margin)) {
    return "El margen debe ser un numero entero.";
  }

  if (margin < 0 || margin > maxWatermarkMargin) {
    return "El margen debe ser cero o mayor y no superar el limite permitido.";
  }

  return null;
}

export function validateWatermarkOptions({ color, fontSize, margin, opacity, text }: ImageWatermarkOptions) {
  if (!text.trim()) {
    return "Ingresa un texto para la marca de agua.";
  }

  const fontSizeError = validateWatermarkFontSize(fontSize);
  if (fontSizeError) return fontSizeError;

  const opacityError = validateWatermarkOpacity(opacity);
  if (opacityError) return opacityError;

  const marginError = validateWatermarkMargin(margin);
  if (marginError) return marginError;

  if (normalizeHexColor(color, "") === "") {
    return "El color debe ser hexadecimal.";
  }

  return null;
}

export function calculateWatermarkPosition(
  imageDimensions: ImageDimensions,
  textDimensions: TextBoxDimensions,
  position: ImageWatermarkPosition,
  margin: number,
) {
  const centerX = Math.round((imageDimensions.width - textDimensions.width) / 2);
  const centerY = Math.round((imageDimensions.height - textDimensions.height) / 2);

  if (position === "top-left") {
    return { x: margin, y: margin };
  }

  if (position === "top-right") {
    return { x: imageDimensions.width - textDimensions.width - margin, y: margin };
  }

  if (position === "bottom-left") {
    return { x: margin, y: imageDimensions.height - textDimensions.height - margin };
  }

  if (position === "bottom-right") {
    return {
      x: imageDimensions.width - textDimensions.width - margin,
      y: imageDimensions.height - textDimensions.height - margin,
    };
  }

  return { x: centerX, y: centerY };
}

export async function readImageMetadata(file: File): Promise<ImageWatermarkMetadata> {
  const mimeType = getBrowserImageMimeType(file);

  if (!mimeType) {
    throw new Error("Selecciona una imagen PNG, JPG o WebP valida.");
  }

  try {
    const image = await loadBrowserImage(file, "No se pudo decodificar la imagen en este navegador.");

    if (image.naturalWidth <= 0 || image.naturalHeight <= 0) {
      throw new Error("La imagen no tiene dimensiones validas.");
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
    throw new Error("Selecciona una imagen PNG, JPG o WebP valida.");
  }

  const validationError = validateWatermarkOptions(options);
  if (validationError) {
    throw new Error(validationError);
  }

  if (!canExportBrowserImageFormat(options.outputFormat)) {
    throw new Error(`Este navegador no permite exportar imagenes como ${getImageFormatLabel(options.outputFormat)}.`);
  }

  const image = await loadBrowserImage(file, "No se pudo decodificar la imagen en este navegador.");
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("No se pudo preparar la imagen.");
  }

  if (options.outputFormat === "jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(image, 0, 0);
  const textDimensions = measureWatermarkText(context, options.text, options.fontSize);
  const coordinates = calculateWatermarkPosition(
    { height: canvas.height, width: canvas.width },
    textDimensions,
    options.position,
    options.margin,
  );

  context.save();
  context.globalAlpha = options.opacity;
  configureWatermarkFont(context, options.fontSize);
  context.fillStyle = normalizeHexColor(options.color);
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillText(options.text, coordinates.x, coordinates.y);
  context.restore();

  const mimeType = getBrowserImageOutputMimeType(options.outputFormat);
  const result = await exportBrowserCanvas(canvas, {
    errorMessage: "No se pudo exportar la imagen con marca de agua.",
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
