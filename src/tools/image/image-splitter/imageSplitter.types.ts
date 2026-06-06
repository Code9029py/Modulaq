import type { BrowserImageOutputFormat } from "../../../shared/utils/imageFiles";

export type ImageSplitterMode = "grid" | "fixed-size";

export type ImageDimensions = {
  height: number;
  width: number;
};

export type ImageSplitterGridOptions = {
  columns: number;
  mode: "grid";
  rows: number;
};

export type ImageSplitterFixedSizeOptions = {
  mode: "fixed-size";
  partHeight: number;
  partWidth: number;
};

export type ImageSplitterOptions = ImageSplitterGridOptions | ImageSplitterFixedSizeOptions;

export type ImageSplitPart = {
  column: number;
  fileName: string;
  height: number;
  index: number;
  row: number;
  width: number;
  x: number;
  y: number;
};

export type ImageSplitterMetadata = {
  fileName: string;
  fileSize: number;
  height: number;
  mimeType: string;
  width: number;
};

export type ImageSplitterOutputFormat = BrowserImageOutputFormat;

export type SplitImageOptions = ImageSplitterOptions & {
  outputBaseName: string;
  outputFormat: ImageSplitterOutputFormat;
  quality?: number;
};

export type ImageSplitterResult = {
  bytes: ArrayBuffer;
  fileName: string;
  mimeType: "application/zip";
  partCount: number;
  parts: ImageSplitPart[];
  size: number;
};

export type ImageSplitterStatus = "idle" | "reading" | "ready" | "processing" | "success" | "error";
