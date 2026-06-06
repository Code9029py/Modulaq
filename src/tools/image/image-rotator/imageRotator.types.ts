import type { BrowserImageOutputFormat } from "../../../shared/utils/imageFiles";

export type ImageRotationDegrees = 0 | 90 | 180 | 270;

export type ImageRotatorAction =
  | "rotate-right"
  | "rotate-left"
  | "rotate-180"
  | "flip-horizontal"
  | "flip-vertical";

export type ImageRotatorTransform = {
  flipHorizontal: boolean;
  flipVertical: boolean;
  rotation: ImageRotationDegrees;
};

export type ImageDimensions = {
  height: number;
  width: number;
};

export type ImageRotatorMetadata = {
  fileName: string;
  fileSize: number;
  height: number;
  mimeType: string;
  width: number;
};

export type ImageRotatorOutputFormat = BrowserImageOutputFormat;

export type RotateImageOptions = {
  outputBaseName: string;
  outputFormat: ImageRotatorOutputFormat;
  quality?: number;
  transform: ImageRotatorTransform;
};

export type ImageRotatorResult = {
  bytes: ArrayBuffer;
  fileName: string;
  format: ImageRotatorOutputFormat;
  height: number;
  mimeType: string;
  size: number;
  width: number;
};

export type ImageRotatorStatus = "idle" | "reading" | "ready" | "processing" | "success" | "error";
