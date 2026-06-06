import type { BrowserImageMimeType, BrowserImageOutputFormat } from "../../../shared/utils/imageFiles";

export type ImageResizerOutputFormat = BrowserImageOutputFormat;

export type ImageResizerStatus = "idle" | "reading" | "ready" | "processing" | "success" | "error";

export type ImageResizeMode = "width" | "height" | "scale" | "custom";

export type ImageResizerMetadata = {
  fileName: string;
  fileSize: number;
  height: number;
  mimeType: BrowserImageMimeType;
  width: number;
};

export type ImageDimensions = {
  height: number;
  width: number;
};

export type ResizeImageOptions = {
  height: number;
  outputBaseName: string;
  outputFormat: ImageResizerOutputFormat;
  quality?: number;
  width: number;
};

export type ImageResizerResult = {
  bytes: ArrayBuffer;
  fileName: string;
  format: ImageResizerOutputFormat;
  height: number;
  mimeType: BrowserImageMimeType;
  size: number;
  sizeDeltaBytes: number;
  sizeDeltaPercent: number;
  width: number;
};
