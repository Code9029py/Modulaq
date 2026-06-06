import { sanitizeDownloadBaseName } from "./downloadFileName";

export type ImageOutputFormat = "png" | "jpeg";
export type BrowserImageOutputFormat = ImageOutputFormat | "webp";
export type BrowserImageMimeType = "image/png" | "image/jpeg" | "image/webp";

export type BrowserImageExportOptions = {
  backgroundColor?: string;
  errorMessage?: string;
  height?: number;
  mimeType: BrowserImageMimeType;
  quality?: number;
  width?: number;
};

export type BrowserImageExportResult = {
  bytes: ArrayBuffer;
  height: number;
  mimeType: BrowserImageMimeType;
  size: number;
  width: number;
};

export const defaultJpegQuality = 0.92;
export const minJpegQuality = 0.1;
export const maxJpegQuality = 1;
export const browserImageMimeTypes: readonly BrowserImageMimeType[] = ["image/png", "image/jpeg", "image/webp"];

const imageExtensionPattern = /\.(png|jpe?g|webp|gif|bmp|svg|avif)$/i;

const imageOutputFormatConfig: Record<ImageOutputFormat, { extension: "png" | "jpg"; mimeType: "image/png" | "image/jpeg" }> = {
  png: {
    extension: "png",
    mimeType: "image/png",
  },
  jpeg: {
    extension: "jpg",
    mimeType: "image/jpeg",
  },
};

const browserImageOutputFormatConfig: Record<
  BrowserImageOutputFormat,
  { extension: "png" | "jpg" | "webp"; mimeType: BrowserImageMimeType }
> = {
  ...imageOutputFormatConfig,
  webp: {
    extension: "webp",
    mimeType: "image/webp",
  },
};

export function getImageOutputExtension(format: ImageOutputFormat) {
  return imageOutputFormatConfig[format].extension;
}

export function getImageOutputMimeType(format: ImageOutputFormat) {
  return imageOutputFormatConfig[format].mimeType;
}

export function getBrowserImageOutputExtension(format: BrowserImageOutputFormat) {
  return browserImageOutputFormatConfig[format].extension;
}

export function getBrowserImageOutputMimeType(format: BrowserImageOutputFormat) {
  return browserImageOutputFormatConfig[format].mimeType;
}

export function normalizeJpegQuality(value: number | undefined, fallback = defaultJpegQuality) {
  const quality = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(maxJpegQuality, Math.max(minJpegQuality, quality));
}

export const normalizeImageQuality = normalizeJpegQuality;

export function jpegQualityPercentToDecimal(value: number) {
  return normalizeJpegQuality(value / 100);
}

export function jpegQualityDecimalToPercent(value: number) {
  return Math.round(normalizeJpegQuality(value) * 100);
}

function stripImageExtension(fileName: string) {
  return fileName.replace(imageExtensionPattern, "");
}

export function getImageDownloadBaseName(fileName: string, fallbackBaseName: string) {
  return sanitizeDownloadBaseName(stripImageExtension(fileName), stripImageExtension(fallbackBaseName));
}

export function buildImageDownloadFileName(baseName: string, format: ImageOutputFormat, fallbackBaseName: string) {
  return `${getImageDownloadBaseName(baseName, fallbackBaseName)}.${getImageOutputExtension(format)}`;
}

export function buildBrowserImageDownloadFileName(
  baseName: string,
  format: BrowserImageOutputFormat,
  fallbackBaseName: string,
) {
  return `${getImageDownloadBaseName(baseName, fallbackBaseName)}.${getBrowserImageOutputExtension(format)}`;
}

export function buildImageZipDownloadFileName(baseName: string, fallbackBaseName: string) {
  return `${getImageDownloadBaseName(baseName, fallbackBaseName)}.zip`;
}

export function buildPagedImageFileName(
  baseName: string,
  pageNumber: number,
  pageCount: number,
  format: ImageOutputFormat,
) {
  const pageLabel = String(pageNumber).padStart(String(pageCount).length, "0");
  return `${baseName}-pagina-${pageLabel}.${getImageOutputExtension(format)}`;
}

export function getBrowserImageMimeType(file: File): BrowserImageMimeType | null {
  if (browserImageMimeTypes.includes(file.type as BrowserImageMimeType)) {
    return file.type as BrowserImageMimeType;
  }

  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".png")) {
    return "image/png";
  }

  if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (fileName.endsWith(".webp")) {
    return "image/webp";
  }

  return null;
}

export function isBrowserImageFile(file: File) {
  return getBrowserImageMimeType(file) !== null;
}

export function canExportBrowserImageMimeType(mimeType: BrowserImageMimeType) {
  if (typeof document === "undefined") {
    return false;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;

  return canvas.toDataURL(mimeType).startsWith(`data:${mimeType}`);
}

export function canExportBrowserImageFormat(format: BrowserImageOutputFormat) {
  return canExportBrowserImageMimeType(getBrowserImageOutputMimeType(format));
}

export async function loadBrowserImage(file: File, errorMessage = "No se pudo leer la imagen.") {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.decoding = "async";

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(errorMessage));
      image.src = imageUrl;
    });

    return image;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export async function exportBrowserImageFile(
  file: File,
  { backgroundColor, errorMessage, height, mimeType, quality, width }: BrowserImageExportOptions,
): Promise<BrowserImageExportResult> {
  const image = await loadBrowserImage(file, errorMessage);
  const canvas = document.createElement("canvas");
  canvas.width = width ?? image.naturalWidth;
  canvas.height = height ?? image.naturalHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("No se pudo preparar la conversión de imagen.");
  }

  if (backgroundColor) {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (nextBlob) => {
        if (nextBlob) {
          resolve(nextBlob);
          return;
        }

        reject(new Error("No se pudo convertir la imagen."));
      },
      mimeType,
      mimeType === "image/png" ? undefined : normalizeImageQuality(quality),
    );
  });

  if (blob.type && blob.type !== mimeType) {
    throw new Error("El navegador no generó el formato de imagen esperado.");
  }

  return {
    bytes: await blob.arrayBuffer(),
    height: canvas.height,
    mimeType,
    size: blob.size,
    width: canvas.width,
  };
}

export async function convertImageFileToPngBytes(file: File) {
  const result = await exportBrowserImageFile(file, { mimeType: "image/png" });
  return new Uint8Array(result.bytes);
}
