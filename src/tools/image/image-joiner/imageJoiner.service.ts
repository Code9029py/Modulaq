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
  ImageJoinerLayout,
  ImageJoinerLayoutOptions,
  ImageJoinerMetadata,
  ImageJoinerMode,
  ImageJoinerOutputFormat,
  ImageJoinerSource,
  JoinImagesOptions,
  ImageJoinerResult,
} from "./imageJoiner.types";

export const defaultOutputBaseName = "imagenes-unidas";
export const maxJoinedCanvasPixels = 100_000_000;
export const maxCanvasSide = 32_000;
export const maxSpacing = 10_000;
export const maxPadding = 10_000;

export { formatFileSize };

export function isJoinableImageFile(file: File) {
  return isBrowserImageFile(file);
}

export function getImageFormatLabel(format: ImageJoinerOutputFormat) {
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

export function getJoinedImageOutputBaseName(fileName: string) {
  const baseName = getImageDownloadBaseName(fileName, defaultOutputBaseName);
  return `${baseName}-unidas`;
}

export function buildJoinedImageFileName(
  baseName: string,
  outputFormat: ImageJoinerOutputFormat,
  fallbackBaseName = defaultOutputBaseName,
) {
  return buildBrowserImageDownloadFileName(baseName, outputFormat, fallbackBaseName);
}

function hasValidImageDimensions(image: ImageDimensions) {
  return (
    Number.isInteger(image.width) &&
    Number.isInteger(image.height) &&
    image.width > 0 &&
    image.height > 0
  );
}

type JoinerIntegerField = "spacing" | "padding";

const integerFieldCodes: Record<JoinerIntegerField, {
  notNumber: string;
  notInteger: string;
  negative: string;
  exceeds: string;
}> = {
  spacing: {
    notNumber: "tools.errors.joinerSpacingNotNumber",
    notInteger: "tools.errors.joinerSpacingNotInteger",
    negative: "tools.errors.joinerSpacingNegative",
    exceeds: "tools.errors.joinerSpacingExceeds",
  },
  padding: {
    notNumber: "tools.errors.joinerPaddingNotNumber",
    notInteger: "tools.errors.joinerPaddingNotInteger",
    negative: "tools.errors.joinerPaddingNegative",
    exceeds: "tools.errors.joinerPaddingExceeds",
  },
};

function validateNonNegativeInteger(
  value: number,
  field: JoinerIntegerField,
  maxValue: number,
): PageSelectionError | null {
  const codes = integerFieldCodes[field];

  if (!Number.isFinite(value)) return { code: codes.notNumber };
  if (!Number.isInteger(value)) return { code: codes.notInteger };
  if (value < 0) return { code: codes.negative };
  if (value > maxValue) return { code: codes.exceeds };

  return null;
}

export function validateImageJoinerOptions(
  images: readonly ImageJoinerSource[],
  { backgroundColor, columns, mode, padding, spacing }: ImageJoinerLayoutOptions,
): PageSelectionError | null {
  if (images.length < 2) {
    return { code: "tools.errors.joinerNeedTwo" };
  }

  if (!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(backgroundColor)) {
    return { code: "tools.errors.joinerInvalidBgColor" };
  }

  if (images.some((image) => !hasValidImageDimensions(image))) {
    return { code: "tools.errors.joinerInvalidImageDims" };
  }

  const spacingError = validateNonNegativeInteger(spacing, "spacing", maxSpacing);
  if (spacingError) return spacingError;

  const paddingError = validateNonNegativeInteger(padding, "padding", maxPadding);
  if (paddingError) return paddingError;

  if (mode === "grid") {
    if (!Number.isFinite(columns) || !Number.isInteger(columns)) {
      return { code: "tools.errors.joinerColumnsNotInteger" };
    }

    if (columns < 1) {
      return { code: "tools.errors.joinerColumnsTooFew" };
    }

    if (columns > images.length) {
      return { code: "tools.errors.joinerColumnsExceed" };
    }
  }

  const layout = calculateImageJoinerLayout(images, { columns, mode, padding, spacing, backgroundColor: "#ffffff" });

  if (layout.width > maxCanvasSide || layout.height > maxCanvasSide) {
    return { code: "tools.errors.joinerCanvasTooLarge" };
  }

  if (layout.width * layout.height > maxJoinedCanvasPixels) {
    return { code: "tools.errors.joinerCanvasExceedsPixels" };
  }

  return null;
}

function getVerticalLayout(images: readonly ImageJoinerSource[], padding: number, spacing: number): ImageJoinerLayout {
  const contentWidth = Math.max(...images.map((image) => image.width));
  let y = padding;
  const positions = images.map((image) => {
    const position = {
      height: image.height,
      id: image.id,
      width: image.width,
      x: padding + Math.floor((contentWidth - image.width) / 2),
      y,
    };
    y += image.height + spacing;
    return position;
  });

  return {
    height: images.reduce((total, image) => total + image.height, padding * 2 + spacing * (images.length - 1)),
    positions,
    width: contentWidth + padding * 2,
  };
}

function getHorizontalLayout(images: readonly ImageJoinerSource[], padding: number, spacing: number): ImageJoinerLayout {
  const contentHeight = Math.max(...images.map((image) => image.height));
  let x = padding;
  const positions = images.map((image) => {
    const position = {
      height: image.height,
      id: image.id,
      width: image.width,
      x,
      y: padding + Math.floor((contentHeight - image.height) / 2),
    };
    x += image.width + spacing;
    return position;
  });

  return {
    height: contentHeight + padding * 2,
    positions,
    width: images.reduce((total, image) => total + image.width, padding * 2 + spacing * (images.length - 1)),
  };
}

function getGridLayout(
  images: readonly ImageJoinerSource[],
  columns: number,
  padding: number,
  spacing: number,
): ImageJoinerLayout {
  const rows = Math.ceil(images.length / columns);
  const cellWidth = Math.max(...images.map((image) => image.width));
  const cellHeight = Math.max(...images.map((image) => image.height));
  const positions = images.map((image, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const cellX = padding + column * (cellWidth + spacing);
    const cellY = padding + row * (cellHeight + spacing);

    return {
      height: image.height,
      id: image.id,
      width: image.width,
      x: cellX + Math.floor((cellWidth - image.width) / 2),
      y: cellY + Math.floor((cellHeight - image.height) / 2),
    };
  });

  return {
    height: rows * cellHeight + Math.max(0, rows - 1) * spacing + padding * 2,
    positions,
    width: columns * cellWidth + Math.max(0, columns - 1) * spacing + padding * 2,
  };
}

export function calculateImageJoinerLayout(
  images: readonly ImageJoinerSource[],
  { columns, mode, padding, spacing }: ImageJoinerLayoutOptions,
): ImageJoinerLayout {
  if (images.length === 0) {
    return { height: padding * 2, positions: [], width: padding * 2 };
  }

  if (mode === "horizontal") {
    return getHorizontalLayout(images, padding, spacing);
  }

  if (mode === "grid") {
    return getGridLayout(images, columns, padding, spacing);
  }

  return getVerticalLayout(images, padding, spacing);
}

export async function readImageMetadata(file: File, id: string): Promise<ImageJoinerMetadata> {
  const mimeType = getBrowserImageMimeType(file);

  if (!mimeType) {
    throw new ToolError("tools.errors.invalidImages");
  }

  try {
    const image = await loadBrowserImage(file, new ToolError("tools.errors.imageLoadOneFailed"));

    if (image.naturalWidth <= 0 || image.naturalHeight <= 0) {
      throw new ToolError("tools.errors.imageNoDimensions");
    }

    return {
      fileName: file.name,
      fileSize: file.size,
      height: image.naturalHeight,
      id,
      mimeType,
      width: image.naturalWidth,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new ToolError("tools.errors.imageLoadOneFailed");
  }
}

function ensureOutputFormatSupported(outputFormat: ImageJoinerOutputFormat) {
  if (!canExportBrowserImageFormat(outputFormat)) {
    throw new ToolError("tools.errors.unsupportedOutputFormat", {
      format: getImageFormatLabel(outputFormat),
    });
  }
}

function fillCanvasBackground(canvas: HTMLCanvasElement, backgroundColor: string) {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new ToolError("tools.errors.joinerOutputFailed");
  }

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  return context;
}

export async function joinImageFiles(files: readonly File[], options: JoinImagesOptions): Promise<ImageJoinerResult> {
  if (files.length < 2) {
    throw new ToolError("tools.errors.joinerNeedTwo");
  }

  for (const file of files) {
    if (!isJoinableImageFile(file)) {
      throw new ToolError("tools.errors.invalidImages");
    }
  }

  ensureOutputFormatSupported(options.outputFormat);

  const loadedImages = await Promise.all(
    files.map(async (file, index) => {
      const image = await loadBrowserImage(file, new ToolError("tools.errors.imageLoadOneFailed"));
      return {
        file,
        id: String(index),
        image,
        height: image.naturalHeight,
        width: image.naturalWidth,
      };
    }),
  );
  const sources = loadedImages.map(({ height, id, width }) => ({ height, id, width }));
  const validationError = validateImageJoinerOptions(sources, options);

  if (validationError) {
    throw new ToolError(validationError.code, validationError.vars);
  }

  const layout = calculateImageJoinerLayout(sources, options);
  const canvas = document.createElement("canvas");
  canvas.width = layout.width;
  canvas.height = layout.height;
  const context = fillCanvasBackground(canvas, options.backgroundColor);

  for (const position of layout.positions) {
    const loadedImage = loadedImages.find((image) => image.id === position.id);
    if (!loadedImage) continue;
    context.drawImage(loadedImage.image, position.x, position.y, position.width, position.height);
  }

  const mimeType = getBrowserImageOutputMimeType(options.outputFormat);
  const result = await exportBrowserCanvas(canvas, {
    canvasError: new ToolError("tools.errors.joinerFailed"),
    mimeType,
    quality: options.quality,
  });

  return {
    bytes: result.bytes,
    fileName: buildJoinedImageFileName(options.outputBaseName, options.outputFormat, getJoinedImageOutputBaseName(files[0].name)),
    format: options.outputFormat,
    height: result.height,
    mimeType,
    size: result.size,
    width: result.width,
  };
}
