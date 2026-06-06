export type ImageColorExtractorMetadata = {
  fileName: string;
  fileSize: number;
  height: number;
  mimeType: string;
  width: number;
};

export type RgbColor = {
  b: number;
  g: number;
  r: number;
};

export type ExtractedImageColor = {
  count: number;
  hex: string;
  percentage: number;
  rgb: RgbColor;
};

export type ExtractImageColorsOptions = {
  colorCount: number;
};

export type ImageColorExtractorResult = {
  colors: ExtractedImageColor[];
  sampledPixels: number;
};

export type ImageColorExtractorStatus = "idle" | "reading" | "ready" | "processing" | "success" | "error";
