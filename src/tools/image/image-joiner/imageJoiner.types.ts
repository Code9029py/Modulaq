import type { BrowserImageOutputFormat } from "../../../shared/utils/imageFiles";

export type ImageJoinerMode = "vertical" | "horizontal" | "grid";

export type ImageDimensions = {
  height: number;
  width: number;
};

export type ImageJoinerSource = ImageDimensions & {
  id: string;
};

export type ImageJoinerLayoutOptions = {
  backgroundColor: string;
  columns: number;
  mode: ImageJoinerMode;
  padding: number;
  spacing: number;
};

export type ImageJoinerPosition = {
  height: number;
  id: string;
  width: number;
  x: number;
  y: number;
};

export type ImageJoinerLayout = {
  height: number;
  positions: ImageJoinerPosition[];
  width: number;
};

export type ImageJoinerMetadata = {
  fileName: string;
  fileSize: number;
  height: number;
  id: string;
  mimeType: string;
  width: number;
};

export type ImageJoinerOutputFormat = BrowserImageOutputFormat;

export type JoinImagesOptions = ImageJoinerLayoutOptions & {
  outputBaseName: string;
  outputFormat: ImageJoinerOutputFormat;
  quality?: number;
};

export type ImageJoinerResult = {
  bytes: ArrayBuffer;
  fileName: string;
  format: ImageJoinerOutputFormat;
  height: number;
  mimeType: string;
  size: number;
  width: number;
};

export type ImageJoinerStatus = "idle" | "reading" | "ready" | "processing" | "success" | "error";
