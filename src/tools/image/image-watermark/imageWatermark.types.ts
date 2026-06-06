import type { BrowserImageOutputFormat } from "../../../shared/utils/imageFiles";

export type ImageWatermarkPosition =
  | "top-left"
  | "top-right"
  | "center"
  | "bottom-left"
  | "bottom-right";

export type ImageDimensions = {
  height: number;
  width: number;
};

export type TextBoxDimensions = ImageDimensions;

export type ImageWatermarkOptions = {
  color: string;
  fontSize: number;
  margin: number;
  opacity: number;
  outputBaseName: string;
  outputFormat: ImageWatermarkOutputFormat;
  position: ImageWatermarkPosition;
  quality?: number;
  text: string;
};

export type WatermarkCoordinates = {
  x: number;
  y: number;
};

export type ImageWatermarkMetadata = {
  fileName: string;
  fileSize: number;
  height: number;
  mimeType: string;
  width: number;
};

export type ImageWatermarkOutputFormat = BrowserImageOutputFormat;

export type ImageWatermarkResult = {
  bytes: ArrayBuffer;
  fileName: string;
  format: ImageWatermarkOutputFormat;
  height: number;
  mimeType: string;
  size: number;
  width: number;
};

export type ImageWatermarkStatus = "idle" | "reading" | "ready" | "processing" | "success" | "error";
