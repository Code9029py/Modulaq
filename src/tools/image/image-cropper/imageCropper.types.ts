import type { BrowserImageOutputFormat } from "../../../shared/utils/imageFiles";

export type ImageCropRect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export type ImageDimensions = {
  height: number;
  width: number;
};

export type ImageCropperMetadata = {
  fileName: string;
  fileSize: number;
  height: number;
  mimeType: string;
  width: number;
};

export type ImageCropperOutputFormat = BrowserImageOutputFormat;

export type CropImageOptions = {
  cropRect: ImageCropRect;
  outputBaseName: string;
  outputFormat: ImageCropperOutputFormat;
  quality?: number;
};

export type ImageCropperResult = {
  bytes: ArrayBuffer;
  fileName: string;
  format: ImageCropperOutputFormat;
  height: number;
  mimeType: string;
  size: number;
  width: number;
};

export type ImageCropperStatus = "idle" | "reading" | "ready" | "processing" | "success" | "error";
