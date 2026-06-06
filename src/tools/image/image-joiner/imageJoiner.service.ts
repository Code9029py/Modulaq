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

function validateNonNegativeInteger(value: number, label: string, maxValue: number) {
  if (!Number.isFinite(value)) {
    return `${label} debe ser un numero valido.`;
  }

  if (!Number.isInteger(value)) {
    return `${label} debe ser un numero entero.`;
  }

  if (value < 0) {
    return `${label} no puede ser negativo.`;
  }

  if (value > maxValue) {
    return `${label} supera el limite permitido.`;
  }

  return null;
}

export function validateImageJoinerOptions(
  images: readonly ImageJoinerSource[],
  { backgroundColor, columns, mode, padding, spacing }: ImageJoinerLayoutOptions,
) {
  if (images.length < 2) {
    return "Agrega al menos dos imagenes para unir.";
  }

  if (!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(backgroundColor)) {
    return "El color de fondo debe ser hexadecimal.";
  }

  if (images.some((image) => !hasValidImageDimensions(image))) {
    return "Todas las imagenes deben tener dimensiones validas.";
  }

  const spacingError = validateNonNegativeInteger(spacing, "La separacion", maxSpacing);
  if (spacingError) return spacingError;

  const paddingError = validateNonNegativeInteger(padding, "El padding", maxPadding);
  if (paddingError) return paddingError;

  if (mode === "grid") {
    if (!Number.isFinite(columns) || !Number.isInteger(columns)) {
      return "Las columnas deben ser un numero entero.";
    }

    if (columns < 1) {
      return "La cuadricula necesita al menos una columna.";
    }

    if (columns > images.length) {
      return "Las columnas no pueden superar la cantidad de imagenes.";
    }
  }

  const layout = calculateImageJoinerLayout(images, { columns, mode, padding, spacing, backgroundColor: "#ffffff" });

  if (layout.width > maxCanvasSide || layout.height > maxCanvasSide) {
    return "La imagen final supera el tamano maximo de canvas.";
  }

  if (layout.width * layout.height > maxJoinedCanvasPixels) {
    return "La imagen final supera el limite de 100 megapixeles.";
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
    throw new Error("Selecciona imagenes PNG, JPG o WebP validas.");
  }

  try {
    const image = await loadBrowserImage(file, "No se pudo decodificar una imagen en este navegador.");

    if (image.naturalWidth <= 0 || image.naturalHeight <= 0) {
      throw new Error("La imagen no tiene dimensiones validas.");
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

    throw new Error("No se pudo leer una imagen.");
  }
}

function ensureOutputFormatSupported(outputFormat: ImageJoinerOutputFormat) {
  if (!canExportBrowserImageFormat(outputFormat)) {
    throw new Error(`Este navegador no permite exportar imagenes como ${getImageFormatLabel(outputFormat)}.`);
  }
}

function fillCanvasBackground(canvas: HTMLCanvasElement, backgroundColor: string) {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("No se pudo preparar la imagen final.");
  }

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  return context;
}

export async function joinImageFiles(files: readonly File[], options: JoinImagesOptions): Promise<ImageJoinerResult> {
  if (files.length < 2) {
    throw new Error("Agrega al menos dos imagenes para unir.");
  }

  for (const file of files) {
    if (!isJoinableImageFile(file)) {
      throw new Error("Selecciona imagenes PNG, JPG o WebP validas.");
    }
  }

  ensureOutputFormatSupported(options.outputFormat);

  const loadedImages = await Promise.all(
    files.map(async (file, index) => {
      const image = await loadBrowserImage(file, "No se pudo decodificar una imagen en este navegador.");
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
    throw new Error(validationError);
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
    errorMessage: "No se pudo exportar la imagen unida.",
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
