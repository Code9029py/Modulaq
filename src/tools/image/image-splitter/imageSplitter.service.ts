import JSZip from "jszip";
import { ToolError } from "../../../shared/errors/ToolError";
import type { PageSelectionError } from "@modulaq/core/ranges";
import { formatFileSize } from "../../../shared/utils/file";
import {
  buildImageZipDownloadFileName,
  canExportBrowserImageFormat,
  exportBrowserCanvas,
  getBrowserImageMimeType,
  getBrowserImageOutputExtension,
  getBrowserImageOutputMimeType,
  getImageDownloadBaseName,
  isBrowserImageFile,
  loadBrowserImage,
} from "../../../shared/utils/imageFiles";
import type {
  ImageDimensions,
  ImageSplitPart,
  ImageSplitterMetadata,
  ImageSplitterOptions,
  ImageSplitterOutputFormat,
  SplitImageOptions,
  ImageSplitterResult,
} from "./imageSplitter.types";

export const defaultOutputBaseName = "imagen-dividida";
export const maxSplitParts = 100;

export { formatFileSize };

export function isSplittableImageFile(file: File) {
  return isBrowserImageFile(file);
}

export function getImageFormatLabel(format: ImageSplitterOutputFormat) {
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

export function getSplitImageOutputBaseName(fileName: string) {
  const baseName = getImageDownloadBaseName(fileName, defaultOutputBaseName);
  return `${baseName}-partes`;
}

export function buildSplitImageZipFileName(baseName: string, fallbackBaseName = defaultOutputBaseName) {
  return buildImageZipDownloadFileName(baseName, fallbackBaseName);
}

function hasValidImageDimensions(imageDimensions: ImageDimensions) {
  return (
    Number.isInteger(imageDimensions.width) &&
    Number.isInteger(imageDimensions.height) &&
    imageDimensions.width > 0 &&
    imageDimensions.height > 0
  );
}

type SplitterIntField = "rows" | "columns" | "partWidth" | "partHeight";

const splitterIntCodes: Record<SplitterIntField, {
  notNumber: string;
  notInteger: string;
  notPositive: string;
}> = {
  rows: {
    notNumber: "tools.errors.splitterRowsNotNumber",
    notInteger: "tools.errors.splitterRowsNotInteger",
    notPositive: "tools.errors.splitterRowsNotPositive",
  },
  columns: {
    notNumber: "tools.errors.splitterColumnsNotNumber",
    notInteger: "tools.errors.splitterColumnsNotInteger",
    notPositive: "tools.errors.splitterColumnsNotPositive",
  },
  partWidth: {
    notNumber: "tools.errors.splitterPartWidthNotNumber",
    notInteger: "tools.errors.splitterPartWidthNotInteger",
    notPositive: "tools.errors.splitterPartWidthNotPositive",
  },
  partHeight: {
    notNumber: "tools.errors.splitterPartHeightNotNumber",
    notInteger: "tools.errors.splitterPartHeightNotInteger",
    notPositive: "tools.errors.splitterPartHeightNotPositive",
  },
};

function validatePositiveInteger(value: number, field: SplitterIntField): PageSelectionError | null {
  const codes = splitterIntCodes[field];
  if (!Number.isFinite(value)) return { code: codes.notNumber };
  if (!Number.isInteger(value)) return { code: codes.notInteger };
  if (value <= 0) return { code: codes.notPositive };
  return null;
}

export function getSplitPartFileName(row: number, column: number, outputFormat: ImageSplitterOutputFormat) {
  return `parte-f${row}-c${column}.${getBrowserImageOutputExtension(outputFormat)}`;
}

function calculateGridParts(
  imageDimensions: ImageDimensions,
  rows: number,
  columns: number,
  outputFormat: ImageSplitterOutputFormat,
) {
  const parts: ImageSplitPart[] = [];

  for (let row = 0; row < rows; row += 1) {
    const y = Math.floor((row * imageDimensions.height) / rows);
    const nextY = Math.floor(((row + 1) * imageDimensions.height) / rows);

    for (let column = 0; column < columns; column += 1) {
      const x = Math.floor((column * imageDimensions.width) / columns);
      const nextX = Math.floor(((column + 1) * imageDimensions.width) / columns);

      parts.push({
        column: column + 1,
        fileName: getSplitPartFileName(row + 1, column + 1, outputFormat),
        height: nextY - y,
        index: parts.length + 1,
        row: row + 1,
        width: nextX - x,
        x,
        y,
      });
    }
  }

  return parts;
}

function calculateFixedSizeParts(
  imageDimensions: ImageDimensions,
  partWidth: number,
  partHeight: number,
  outputFormat: ImageSplitterOutputFormat,
) {
  const rows = Math.ceil(imageDimensions.height / partHeight);
  const columns = Math.ceil(imageDimensions.width / partWidth);
  const parts: ImageSplitPart[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = column * partWidth;
      const y = row * partHeight;

      parts.push({
        column: column + 1,
        fileName: getSplitPartFileName(row + 1, column + 1, outputFormat),
        height: Math.min(partHeight, imageDimensions.height - y),
        index: parts.length + 1,
        row: row + 1,
        width: Math.min(partWidth, imageDimensions.width - x),
        x,
        y,
      });
    }
  }

  return parts;
}

export function calculateImageSplitParts(
  imageDimensions: ImageDimensions,
  options: ImageSplitterOptions,
  outputFormat: ImageSplitterOutputFormat = "png",
) {
  if (options.mode === "fixed-size") {
    return calculateFixedSizeParts(imageDimensions, options.partWidth, options.partHeight, outputFormat);
  }

  return calculateGridParts(imageDimensions, options.rows, options.columns, outputFormat);
}

export function validateImageSplitterOptions(
  imageDimensions: ImageDimensions,
  options: ImageSplitterOptions,
): PageSelectionError | null {
  if (!hasValidImageDimensions(imageDimensions)) {
    return { code: "tools.errors.splitterInvalidImageDims" };
  }

  if (options.mode === "grid") {
    const rowsError = validatePositiveInteger(options.rows, "rows");
    if (rowsError) return rowsError;

    const columnsError = validatePositiveInteger(options.columns, "columns");
    if (columnsError) return columnsError;
  } else {
    const widthError = validatePositiveInteger(options.partWidth, "partWidth");
    if (widthError) return widthError;

    const heightError = validatePositiveInteger(options.partHeight, "partHeight");
    if (heightError) return heightError;
  }

  const parts = calculateImageSplitParts(imageDimensions, options);
  if (parts.some((part) => part.width <= 0 || part.height <= 0)) {
    return { code: "tools.errors.splitterPartNotPositive" };
  }

  if (parts.length > maxSplitParts) {
    return { code: "tools.errors.splitterExceedsParts", vars: { max: maxSplitParts } };
  }

  return null;
}

export async function readImageMetadata(file: File): Promise<ImageSplitterMetadata> {
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

export async function splitImageFile(file: File, options: SplitImageOptions): Promise<ImageSplitterResult> {
  if (!isSplittableImageFile(file)) {
    throw new ToolError("tools.errors.invalidImage");
  }

  if (!canExportBrowserImageFormat(options.outputFormat)) {
    throw new ToolError("tools.errors.unsupportedOutputFormat", {
      format: getImageFormatLabel(options.outputFormat),
    });
  }

  const image = await loadBrowserImage(file);
  const imageDimensions = { height: image.naturalHeight, width: image.naturalWidth };
  const validationError = validateImageSplitterOptions(imageDimensions, options);

  if (validationError) {
    throw new ToolError(validationError.code, validationError.vars);
  }

  const parts = calculateImageSplitParts(imageDimensions, options, options.outputFormat);
  const mimeType = getBrowserImageOutputMimeType(options.outputFormat);
  const zip = new JSZip();

  for (const part of parts) {
    const canvas = document.createElement("canvas");
    canvas.width = part.width;
    canvas.height = part.height;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new ToolError("tools.errors.splitterPartFailed");
    }

    if (options.outputFormat === "jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    context.drawImage(image, part.x, part.y, part.width, part.height, 0, 0, part.width, part.height);

    const result = await exportBrowserCanvas(canvas, {
      canvasError: new ToolError("tools.errors.splitterPartFailed"),
      mimeType,
      quality: options.quality,
    });
    zip.file(part.fileName, result.bytes);
  }

  try {
    const bytes = await zip.generateAsync({ type: "arraybuffer" });
    return {
      bytes,
      fileName: buildSplitImageZipFileName(options.outputBaseName, getSplitImageOutputBaseName(file.name)),
      mimeType: "application/zip",
      partCount: parts.length,
      parts,
      size: bytes.byteLength,
    };
  } catch {
    throw new ToolError("tools.errors.zipPrepareFailed");
  }
}
