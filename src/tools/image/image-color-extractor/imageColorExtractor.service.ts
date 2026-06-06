import { formatFileSize } from "../../../shared/utils/file";
import {
  getBrowserImageMimeType,
  getImageDownloadBaseName,
  isBrowserImageFile,
  loadBrowserImage,
} from "../../../shared/utils/imageFiles";
import type {
  ExtractedImageColor,
  ExtractImageColorsOptions,
  ImageColorExtractorMetadata,
  ImageColorExtractorResult,
  RgbColor,
} from "./imageColorExtractor.types";

export const defaultOutputBaseName = "paleta-imagen";
export const defaultColorCount = 6;
export const colorCountOptions = [4, 6, 8, 12] as const;
export const maxSamplePixels = 50_000;
const bucketSize = 32;

type ColorBucket = {
  b: number;
  count: number;
  g: number;
  r: number;
};

export { formatFileSize };

export function isColorExtractableImageFile(file: File) {
  return isBrowserImageFile(file);
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

export function getPaletteOutputBaseName(fileName: string) {
  const baseName = getImageDownloadBaseName(fileName, defaultOutputBaseName);
  return `${baseName}-colores`;
}

export function buildPaletteFileName(baseName: string, extension: "json" | "txt", fallbackBaseName = defaultOutputBaseName) {
  return `${getImageDownloadBaseName(baseName, fallbackBaseName)}.${extension}`;
}

function clampByte(value: number) {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function byteToHex(value: number) {
  return clampByte(value).toString(16).padStart(2, "0").toUpperCase();
}

export function rgbToHex({ b, g, r }: RgbColor) {
  return `#${byteToHex(r)}${byteToHex(g)}${byteToHex(b)}`;
}

export function formatRgb({ b, g, r }: RgbColor) {
  return `rgb(${clampByte(r)}, ${clampByte(g)}, ${clampByte(b)})`;
}

export function quantizeRgb({ b, g, r }: RgbColor) {
  return {
    b: Math.floor(clampByte(b) / bucketSize),
    g: Math.floor(clampByte(g) / bucketSize),
    r: Math.floor(clampByte(r) / bucketSize),
  };
}

function getBucketKey(color: RgbColor) {
  const quantized = quantizeRgb(color);
  return `${quantized.r}:${quantized.g}:${quantized.b}`;
}

function normalizeColorCount(colorCount: number) {
  return colorCountOptions.includes(colorCount as (typeof colorCountOptions)[number])
    ? colorCount
    : defaultColorCount;
}

function toExtractedColor(bucket: ColorBucket, visiblePixelCount: number): ExtractedImageColor {
  const rgb = {
    b: Math.round(bucket.b / bucket.count),
    g: Math.round(bucket.g / bucket.count),
    r: Math.round(bucket.r / bucket.count),
  };

  return {
    count: bucket.count,
    hex: rgbToHex(rgb),
    percentage: visiblePixelCount > 0 ? (bucket.count / visiblePixelCount) * 100 : 0,
    rgb,
  };
}

export function extractDominantColorsFromImageData(
  data: Uint8ClampedArray,
  { colorCount }: ExtractImageColorsOptions,
): ImageColorExtractorResult {
  const buckets = new Map<string, ColorBucket>();
  let visiblePixelCount = 0;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3] ?? 255;
    if (alpha === 0) continue;

    const color = {
      b: data[index + 2] ?? 0,
      g: data[index + 1] ?? 0,
      r: data[index] ?? 0,
    };
    const key = getBucketKey(color);
    const bucket = buckets.get(key) ?? { b: 0, count: 0, g: 0, r: 0 };

    bucket.b += color.b;
    bucket.count += 1;
    bucket.g += color.g;
    bucket.r += color.r;
    buckets.set(key, bucket);
    visiblePixelCount += 1;
  }

  const colors = Array.from(buckets.values())
    .sort((first, second) => second.count - first.count)
    .slice(0, normalizeColorCount(colorCount))
    .map((bucket) => toExtractedColor(bucket, visiblePixelCount));

  return {
    colors,
    sampledPixels: visiblePixelCount,
  };
}

export function calculateSampleDimensions(width: number, height: number, maxPixels = maxSamplePixels) {
  if (width <= 0 || height <= 0) {
    return { height: 0, width: 0 };
  }

  const pixelCount = width * height;
  if (pixelCount <= maxPixels) {
    return { height, width };
  }

  const scale = Math.sqrt(maxPixels / pixelCount);
  return {
    height: Math.max(1, Math.round(height * scale)),
    width: Math.max(1, Math.round(width * scale)),
  };
}

export function exportPaletteAsTxt(colors: readonly ExtractedImageColor[]) {
  return colors
    .map((color, index) => {
      const percentage = `${color.percentage.toFixed(1)}%`;
      return `${index + 1}. ${color.hex} | ${formatRgb(color.rgb)} | ${percentage}`;
    })
    .join("\n");
}

export function exportPaletteAsJson(colors: readonly ExtractedImageColor[]) {
  return JSON.stringify(
    colors.map((color) => ({
      count: color.count,
      hex: color.hex,
      percentage: Number(color.percentage.toFixed(2)),
      rgb: color.rgb,
    })),
    null,
    2,
  );
}

export async function readImageMetadata(file: File): Promise<ImageColorExtractorMetadata> {
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

export async function extractImageColors(
  file: File,
  { colorCount }: ExtractImageColorsOptions,
): Promise<ImageColorExtractorResult> {
  if (!isColorExtractableImageFile(file)) {
    throw new Error("Selecciona una imagen PNG, JPG o WebP valida.");
  }

  const image = await loadBrowserImage(file, "No se pudo decodificar la imagen en este navegador.");
  const sampleDimensions = calculateSampleDimensions(image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = sampleDimensions.width;
  canvas.height = sampleDimensions.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("No se pudo analizar la imagen.");
  }

  context.drawImage(image, 0, 0, sampleDimensions.width, sampleDimensions.height);
  const imageData = context.getImageData(0, 0, sampleDimensions.width, sampleDimensions.height);
  return extractDominantColorsFromImageData(imageData.data, { colorCount });
}
