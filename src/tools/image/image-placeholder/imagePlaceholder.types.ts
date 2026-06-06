import type { BrowserImageOutputFormat } from "../../../shared/utils/imageFiles";

export type ImagePlaceholderOutputFormat = BrowserImageOutputFormat;

export type ImagePlaceholderOptions = {
  backgroundColor: string;
  height: number;
  outputBaseName: string;
  outputFormat: ImagePlaceholderOutputFormat;
  quality?: number;
  text: string;
  textColor: string;
  width: number;
};

export type ImagePlaceholderResult = {
  bytes: ArrayBuffer;
  fileName: string;
  format: ImagePlaceholderOutputFormat;
  height: number;
  mimeType: string;
  size: number;
  width: number;
};

export type ImagePlaceholderStatus = "idle" | "processing" | "success" | "error";
