import type { BrowserImageMimeType, BrowserImageOutputFormat } from "../../../shared/utils/imageFiles";

export type ImageCompressorOutputFormat = BrowserImageOutputFormat;

export type ImageCompressorStatus = "idle" | "reading" | "ready" | "processing" | "success" | "error";

export type ImageCompressorMetadata = {
  fileName: string;
  fileSize: number;
  height: number;
  mimeType: BrowserImageMimeType;
  width: number;
};

export type CompressImageOptions = {
  outputBaseName: string;
  outputFormat: ImageCompressorOutputFormat;
  quality?: number;
};

export type ImageSizeChangeDirection = "reduction" | "increase" | "same";

export type ImageSizeChange = {
  deltaBytes: number;
  direction: ImageSizeChangeDirection;
  percentage: number;
};

export type ImageCompressorResult = {
  bytes: ArrayBuffer;
  fileName: string;
  format: ImageCompressorOutputFormat;
  height: number;
  mimeType: BrowserImageMimeType;
  size: number;
  sizeChange: ImageSizeChange;
  width: number;
};
