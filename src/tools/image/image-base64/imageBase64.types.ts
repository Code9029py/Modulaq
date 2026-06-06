import type { BrowserImageMimeType } from "../../../shared/utils/imageFiles";

export type ImageBase64Mode = "image-to-base64" | "base64-to-image";

export type ImageBase64Status = "idle" | "reading" | "ready" | "processing" | "success" | "error";

export type ImageBase64CopyTarget = "base64" | "data-url";

export type ImageBase64Metadata = {
  base64: string;
  dataUrl: string;
  extension: string;
  fileName: string;
  fileSize: number;
  mimeType: BrowserImageMimeType;
  textSize: number;
};

export type ParsedDataUrl = {
  base64: string;
  mimeType: string;
};

export type Base64ImageResult = {
  base64: string;
  blob: Blob;
  dataUrl: string;
  extension: string;
  fileName: string;
  mimeType: BrowserImageMimeType;
  textSize: number;
};
