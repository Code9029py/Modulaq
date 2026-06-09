import { ToolError } from "../../../shared/errors/ToolError";
import { formatFileSize } from "../../../shared/utils/file";
import {
  getBrowserImageMimeType,
  getImageDownloadBaseName,
  isBrowserImageFile,
  type BrowserImageMimeType,
} from "../../../shared/utils/imageFiles";
import type { Base64ImageResult, ImageBase64Metadata, ParsedDataUrl } from "./imageBase64.types";

export const defaultTextOutputBaseName = "imagen-base64";
export const defaultImageOutputBaseName = "imagen-reconstruida";

export const base64ImageMimeTypes: readonly BrowserImageMimeType[] = ["image/png", "image/jpeg", "image/webp"];

export { formatFileSize };

export function inferExtensionFromMime(mimeType: string) {
  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/jpeg") {
    return "jpg";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  return null;
}

export function getMimeLabel(mimeType: string) {
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

export function isSupportedBase64ImageMime(mimeType: string): mimeType is BrowserImageMimeType {
  return base64ImageMimeTypes.includes(mimeType as BrowserImageMimeType);
}

export function stripDataUrlPrefix(input: string) {
  const parsed = parseDataUrl(input);
  return parsed ? parsed.base64 : input.trim();
}

export function parseDataUrl(input: string): ParsedDataUrl | null {
  const trimmed = input.trim();
  const match = trimmed.match(/^data:([^;,]+);base64,([\s\S]+)$/i);

  if (!match) {
    return null;
  }

  const mimeType = match[1].trim().toLowerCase();
  const base64 = match[2].trim();

  if (!mimeType || !base64 || !isValidBase64(base64)) {
    return null;
  }

  return { mimeType, base64: normalizeBase64(base64) };
}

export function normalizeBase64(input: string) {
  return input.replace(/\s+/g, "");
}

export function isValidBase64(input: string) {
  const normalized = normalizeBase64(input);

  if (!normalized || normalized.length % 4 !== 0) {
    return false;
  }

  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
    return false;
  }

  if (/=.+/.test(normalized.replace(/=+$/, ""))) {
    return false;
  }

  try {
    if (typeof atob === "function") {
      atob(normalized);
    }
    return true;
  } catch {
    return false;
  }
}

export function buildDataUrl(base64: string, mimeType: BrowserImageMimeType) {
  const normalized = normalizeBase64(base64);
  return `data:${mimeType};base64,${normalized}`;
}

export function getBase64TextSize(base64: string, mimeType?: BrowserImageMimeType) {
  return mimeType ? buildDataUrl(base64, mimeType).length : normalizeBase64(base64).length;
}

export function buildBase64TextFileName(baseName: string) {
  return `${getImageDownloadBaseName(baseName, defaultTextOutputBaseName)}.txt`;
}

export function buildBase64ImageFileName(baseName: string, mimeType: BrowserImageMimeType) {
  const extension = inferExtensionFromMime(mimeType) ?? "png";
  return `${getImageDownloadBaseName(baseName, defaultImageOutputBaseName)}.${extension}`;
}

export function isImageFile(file: File) {
  return isBrowserImageFile(file);
}

export async function fileToBase64(file: File): Promise<ImageBase64Metadata> {
  const mimeType = getBrowserImageMimeType(file);

  if (!mimeType) {
    throw new ToolError("tools.errors.invalidImage");
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new ToolError("tools.errors.base64DataUrlBuildFailed"));
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new ToolError("tools.errors.base64DataUrlBuildFailed"));
    };
    reader.readAsDataURL(file);
  });
  const parsed = parseDataUrl(dataUrl);

  if (!parsed || !isSupportedBase64ImageMime(parsed.mimeType)) {
    throw new ToolError("tools.errors.base64DataUrlBuildFailed");
  }

  const extension = inferExtensionFromMime(parsed.mimeType) ?? "png";

  return {
    base64: parsed.base64,
    dataUrl,
    extension,
    fileName: file.name,
    fileSize: file.size,
    mimeType: parsed.mimeType,
    textSize: dataUrl.length,
  };
}

export function base64ToBlob(base64: string, mimeType: BrowserImageMimeType) {
  const normalized = normalizeBase64(base64);

  if (!isValidBase64(normalized)) {
    throw new ToolError("tools.errors.invalidBase64");
  }

  if (typeof atob !== "function") {
    throw new ToolError("tools.errors.base64DecodeUnavailable");
  }

  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

export function parseBase64ImageInput(input: string, fallbackMimeType: BrowserImageMimeType): Base64ImageResult {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new ToolError("tools.errors.invalidBase64OrDataUrl");
  }

  const parsedDataUrl = parseDataUrl(trimmed);
  const mimeType = parsedDataUrl?.mimeType ?? fallbackMimeType;

  if (!isSupportedBase64ImageMime(mimeType)) {
    throw new ToolError("tools.errors.invalidDataUrl");
  }

  const base64 = parsedDataUrl ? parsedDataUrl.base64 : normalizeBase64(trimmed);

  if (!isValidBase64(base64)) {
    throw new ToolError("tools.errors.invalidBase64");
  }

  const blob = base64ToBlob(base64, mimeType);
  const dataUrl = buildDataUrl(base64, mimeType);
  const extension = inferExtensionFromMime(mimeType) ?? "png";

  return {
    base64,
    blob,
    dataUrl,
    extension,
    fileName: buildBase64ImageFileName(defaultImageOutputBaseName, mimeType),
    mimeType,
    textSize: dataUrl.length,
  };
}
