import JSZip from "jszip";
import { ToolError } from "../../../shared/errors/ToolError";
import type { Language } from "../../../shared/i18n/types";
import type { PageSelectionError } from "@modulaq/core/ranges";
import { formatFileSize } from "../../../shared/utils/file";
import {
  buildImageZipDownloadFileName,
  exportBrowserCanvas,
  getBrowserImageMimeType,
  getImageDownloadBaseName,
  isBrowserImageFile,
  loadBrowserImage,
} from "../../../shared/utils/imageFiles";
import type {
  FaviconIconSpec,
  ImageDimensions,
  ImageToFaviconMetadata,
  ImageToFaviconOptions,
  ImageToFaviconResult,
  ImageToFaviconResultIcon,
} from "./imageToFavicon.types";

export const defaultOutputBaseName = "pack-favicon";
export const maxFaviconSourcePixels = 64_000_000;

export const faviconIconSpecs = [
  { fileName: "favicon-16x16.png", label: "Favicon 16x16", size: 16 },
  { fileName: "favicon-32x32.png", label: "Favicon 32x32", size: 32 },
  { fileName: "favicon-48x48.png", label: "Favicon 48x48", size: 48 },
  { fileName: "apple-touch-icon.png", label: "Apple touch icon", size: 180 },
  { fileName: "icon-192.png", label: "PWA icon 192", size: 192 },
  { fileName: "icon-512.png", label: "PWA icon 512", size: 512 },
] as const satisfies readonly FaviconIconSpec[];

export { formatFileSize };

export function isFaviconSourceImageFile(file: File) {
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

export function getFaviconOutputBaseName(fileName: string) {
  const baseName = getImageDownloadBaseName(fileName, defaultOutputBaseName);
  return `${baseName}-favicon`;
}

export function buildFaviconZipFileName(baseName: string, fallbackBaseName = defaultOutputBaseName) {
  return buildImageZipDownloadFileName(baseName, fallbackBaseName);
}

export function getFaviconIconSpecs() {
  return faviconIconSpecs.map((icon) => ({ ...icon }));
}

export function validateFaviconSourceDimensions(
  imageDimensions: ImageDimensions,
): PageSelectionError | null {
  if (!Number.isFinite(imageDimensions.width) || !Number.isFinite(imageDimensions.height)) {
    return { code: "tools.errors.splitterInvalidImageDims" };
  }

  if (!Number.isInteger(imageDimensions.width) || !Number.isInteger(imageDimensions.height)) {
    return { code: "tools.errors.dimensionsNotInteger" };
  }

  if (imageDimensions.width <= 0 || imageDimensions.height <= 0) {
    return { code: "tools.errors.dimensionsNotPositive" };
  }

  if (imageDimensions.width * imageDimensions.height > maxFaviconSourcePixels) {
    return { code: "tools.errors.placeholderPixelLimit" };
  }

  return null;
}

const readmeCopy = {
  es: {
    title: "Imagen a favicon - Modulaq",
    description: "Este ZIP contiene iconos PNG. No incluye un archivo .ico clasico.",
    files: "Archivos:",
    htmlExamples: "Ejemplos HTML:",
  },
  en: {
    title: "Image to favicon - Modulaq",
    description: "This ZIP contains PNG icons. It does not include a classic .ico file.",
    files: "Files:",
    htmlExamples: "HTML examples:",
  },
} as const;

export function createFaviconPackReadme(
  iconSpecs: readonly FaviconIconSpec[] = faviconIconSpecs,
  language: Language = "es",
) {
  const labels = readmeCopy[language];
  const iconList = iconSpecs.map((icon) => `- ${icon.fileName}: ${icon.size}x${icon.size}px`).join("\n");

  return [
    labels.title,
    "",
    labels.description,
    "",
    labels.files,
    iconList,
    "",
    labels.htmlExamples,
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    "",
    "Manifest/PWA:",
    '{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" }',
    '{ "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }',
  ].join("\n");
}

export async function readImageMetadata(file: File): Promise<ImageToFaviconMetadata> {
  const mimeType = getBrowserImageMimeType(file);

  if (!mimeType) {
    throw new ToolError("tools.errors.invalidImage");
  }

  try {
    const image = await loadBrowserImage(file);
    const validationError = validateFaviconSourceDimensions({
      height: image.naturalHeight,
      width: image.naturalWidth,
    });

    if (validationError) {
      throw new ToolError(validationError.code, validationError.vars);
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

function drawCoveredSquareImage(canvas: HTMLCanvasElement, image: HTMLImageElement, size: number) {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new ToolError("tools.errors.faviconBuildFailed");
  }

  canvas.width = size;
  canvas.height = size;
  context.clearRect(0, 0, size, size);

  const scale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const drawX = (size - drawWidth) / 2;
  const drawY = (size - drawHeight) / 2;

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

async function createFaviconIcon(image: HTMLImageElement, iconSpec: FaviconIconSpec): Promise<ImageToFaviconResultIcon & { bytes: ArrayBuffer }> {
  const canvas = document.createElement("canvas");
  drawCoveredSquareImage(canvas, image, iconSpec.size);

  const result = await exportBrowserCanvas(canvas, {
    canvasError: new ToolError("tools.errors.faviconBuildFailed"),
    mimeType: "image/png",
  });

  return {
    ...iconSpec,
    byteSize: result.size,
    bytes: result.bytes,
  };
}

export async function generateFaviconPack(
  file: File,
  { outputBaseName, language = "es" }: ImageToFaviconOptions,
): Promise<ImageToFaviconResult> {
  if (!isFaviconSourceImageFile(file)) {
    throw new ToolError("tools.errors.invalidImage");
  }

  const image = await loadBrowserImage(file);
  const validationError = validateFaviconSourceDimensions({
    height: image.naturalHeight,
    width: image.naturalWidth,
  });

  if (validationError) {
    throw new ToolError(validationError.code, validationError.vars);
  }

  const zip = new JSZip();
  const iconResults = await Promise.all(faviconIconSpecs.map((iconSpec) => createFaviconIcon(image, iconSpec)));

  for (const icon of iconResults) {
    zip.file(icon.fileName, icon.bytes);
  }

  zip.file("README.txt", createFaviconPackReadme(faviconIconSpecs, language));

  try {
    const bytes = await zip.generateAsync({ type: "arraybuffer" });
    return {
      bytes,
      fileName: buildFaviconZipFileName(outputBaseName, getFaviconOutputBaseName(file.name)),
      iconCount: faviconIconSpecs.length,
      icons: iconResults.map(({ bytes: _bytes, ...icon }) => icon),
      mimeType: "application/zip",
      size: bytes.byteLength,
    };
  } catch {
    throw new ToolError("tools.errors.zipPrepareFailed");
  }
}
