import type { BrowserImageOutputFormat } from "../../../shared/utils/imageFiles";

export type ImageWatermarkPosition =
  | "top-left"
  | "top-right"
  | "center"
  | "bottom-left"
  | "bottom-right";

export type ImageWatermarkKind = "text" | "image";

export type ImageDimensions = {
  height: number;
  width: number;
};

export type TextBoxDimensions = ImageDimensions;

export type SharedImageWatermarkOptions = {
  margin: number;
  opacity: number;
  outputBaseName: string;
  outputFormat: ImageWatermarkOutputFormat;
  position: ImageWatermarkPosition;
  quality?: number;
};

export type TextImageWatermarkOptions = SharedImageWatermarkOptions & {
  color: string;
  fontSize: number;
  kind: "text";
  text: string;
};

export type LogoImageWatermarkOptions = SharedImageWatermarkOptions & {
  kind: "image";
  logoFile: File;
  logoMaxWidthPercent: number;
};

export type ImageWatermarkOptions = TextImageWatermarkOptions | LogoImageWatermarkOptions;

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
