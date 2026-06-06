import { formatFileSize } from "../../../shared/utils/file";
import {
  buildBrowserImageDownloadFileName,
  exportBrowserCanvas,
  getImageDownloadBaseName,
  loadBrowserImage,
} from "../../../shared/utils/imageFiles";
import type { SvgDimensions, SvgToPngMetadata, SvgToPngOptions, SvgToPngResult, SvgViewBox } from "./svgToPng.types";

export const defaultSvgPngBaseName = "svg-to-png";
export const defaultSvgOutputWidth = 512;
export const defaultSvgOutputHeight = 512;
export const defaultSvgBackgroundColor = "#FFFFFF";
export const maxSvgOutputSide = 8000;
export const maxSvgOutputPixels = 64_000_000;

export { formatFileSize };

const svgTagPattern = /<svg(?:\s|>|\/)/i;
const svgCloseTagPattern = /<\/svg\s*>/i;
const scriptTagPattern = /<script(?:\s|>|\/)/i;
const externalResourcePattern =
  /\b(?:href|xlink:href)\s*=\s*["'](?:https?:)?\/\//i;
const externalUrlPattern = /url\(\s*["']?(?:https?:)?\/\//i;

export function looksLikeSvg(content: string) {
  return svgTagPattern.test(content) && svgCloseTagPattern.test(content);
}

export function hasSvgScript(content: string) {
  return scriptTagPattern.test(content);
}

export function hasExternalSvgResources(content: string) {
  return externalResourcePattern.test(content) || externalUrlPattern.test(content);
}

export function validateSvgContent(content: string) {
  if (!looksLikeSvg(content)) {
    return "El contenido debe incluir una etiqueta SVG valida.";
  }

  if (hasSvgScript(content)) {
    return "No se admiten SVG con scripts.";
  }

  return null;
}

function parseSvgNumber(value: string | undefined) {
  if (!value) return null;

  const trimmedValue = value.trim();
  if (trimmedValue.endsWith("%")) return null;

  const match = trimmedValue.match(/^([+-]?(?:\d+\.?\d*|\.\d+))(?:px|pt|pc|mm|cm|in|em|rem)?$/i);
  if (!match) return null;

  const numberValue = Number(match[1]);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
}

function readSvgAttribute(content: string, attributeName: string) {
  const svgOpenMatch = content.match(/<svg\b[^>]*>/i);
  if (!svgOpenMatch) return undefined;

  const attributePattern = new RegExp(`\\b${attributeName}\\s*=\\s*["']([^"']+)["']`, "i");
  return svgOpenMatch[0].match(attributePattern)?.[1];
}

export function extractSvgViewBox(content: string): SvgViewBox | null {
  const value = readSvgAttribute(content, "viewBox");
  if (!value) return null;

  const parts = value
    .trim()
    .split(/[\s,]+/)
    .map((part) => Number(part));

  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    return null;
  }

  const [minX, minY, width, height] = parts;
  if (width <= 0 || height <= 0) return null;

  return { height, minX, minY, width };
}

export function extractSvgDimensions(content: string): SvgDimensions {
  const viewBox = extractSvgViewBox(content);
  const width = parseSvgNumber(readSvgAttribute(content, "width")) ?? viewBox?.width ?? null;
  const height = parseSvgNumber(readSvgAttribute(content, "height")) ?? viewBox?.height ?? null;

  return { height, viewBox, width };
}

export function getDefaultSvgOutputDimensions(dimensions: SvgDimensions) {
  const width = dimensions.width ?? dimensions.viewBox?.width ?? defaultSvgOutputWidth;
  const height = dimensions.height ?? dimensions.viewBox?.height ?? defaultSvgOutputHeight;

  return {
    height: Math.max(1, Math.round(height)),
    width: Math.max(1, Math.round(width)),
  };
}

export function validateSvgOutputDimensions(width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return "El ancho y el alto deben ser numeros validos.";
  }

  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    return "El ancho y el alto deben ser numeros enteros.";
  }

  if (width <= 0 || height <= 0) {
    return "El ancho y el alto deben ser mayores que cero.";
  }

  if (width > maxSvgOutputSide || height > maxSvgOutputSide) {
    return `El ancho y el alto no pueden superar ${maxSvgOutputSide}px.`;
  }

  if (width * height > maxSvgOutputPixels) {
    return "La imagen supera el limite de 64 megapixeles.";
  }

  return null;
}

export function normalizeHexColor(value: string, fallback = defaultSvgBackgroundColor) {
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

export function getSvgPngOutputBaseName(fileName?: string | null) {
  if (!fileName) return defaultSvgPngBaseName;
  return getImageDownloadBaseName(fileName, defaultSvgPngBaseName);
}

export function buildSvgPngFileName(baseName: string, fallbackBaseName = defaultSvgPngBaseName) {
  return buildBrowserImageDownloadFileName(baseName, "png", fallbackBaseName);
}

export function analyzeSvgSource(content: string, fileName: string | null = null): SvgToPngMetadata {
  const validationError = validateSvgContent(content);
  if (validationError) {
    throw new Error(validationError);
  }

  return {
    ...extractSvgDimensions(content),
    fileName,
    hasExternalResources: hasExternalSvgResources(content),
    sourceSize: new Blob([content], { type: "image/svg+xml" }).size,
  };
}

export async function readSvgFile(file: File) {
  const text = await file.text();
  return {
    metadata: analyzeSvgSource(text, file.name),
    text,
  };
}

function createSvgFile(content: string) {
  return new File([content], "source.svg", { type: "image/svg+xml" });
}

export async function convertSvgToPng(content: string, options: SvgToPngOptions): Promise<SvgToPngResult> {
  const validationError = validateSvgContent(content);
  if (validationError) {
    throw new Error(validationError);
  }

  const dimensionError = validateSvgOutputDimensions(options.width, options.height);
  if (dimensionError) {
    throw new Error(dimensionError);
  }

  const canvas = document.createElement("canvas");
  canvas.width = options.width;
  canvas.height = options.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo preparar el PNG.");
  }

  if (!options.transparentBackground) {
    context.fillStyle = normalizeHexColor(options.backgroundColor);
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  try {
    const image = await loadBrowserImage(createSvgFile(content), "No se pudo renderizar el SVG.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const result = await exportBrowserCanvas(canvas, {
      errorMessage: "No se pudo exportar el PNG.",
      mimeType: "image/png",
    });

    return {
      bytes: result.bytes,
      fileName: buildSvgPngFileName(options.outputBaseName),
      height: result.height,
      mimeType: "image/png",
      size: result.size,
      width: result.width,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("No se pudo convertir el SVG a PNG.");
  }
}
