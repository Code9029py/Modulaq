import type { BrowserImageMimeType, BrowserImageOutputFormat } from "../../../shared/utils/imageFiles";

export type ImageConverterOutputFormat = BrowserImageOutputFormat;

export type ImageConverterStatus = "idle" | "reading" | "ready" | "processing" | "success" | "error";

export type ImageConverterMetadata = {
  fileName: string;
  fileSize: number;
  mimeType: BrowserImageMimeType;
  width: number;
  height: number;
};

export type ConvertImageOptions = {
  outputBaseName: string;
  outputFormat: ImageConverterOutputFormat;
  quality?: number;
};

export type ImageConverterResult = {
  bytes: ArrayBuffer;
  fileName: string;
  format: ImageConverterOutputFormat;
  height: number;
  mimeType: BrowserImageMimeType;
  size: number;
  width: number;
};
