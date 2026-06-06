export type SvgViewBox = {
  height: number;
  minX: number;
  minY: number;
  width: number;
};

export type SvgDimensions = {
  height: number | null;
  viewBox: SvgViewBox | null;
  width: number | null;
};

export type SvgToPngMetadata = SvgDimensions & {
  fileName: string | null;
  hasExternalResources: boolean;
  sourceSize: number;
};

export type SvgToPngOptions = {
  backgroundColor: string;
  height: number;
  outputBaseName: string;
  transparentBackground: boolean;
  width: number;
};

export type SvgToPngResult = {
  bytes: ArrayBuffer;
  fileName: string;
  height: number;
  mimeType: "image/png";
  size: number;
  width: number;
};

export type SvgToPngStatus = "idle" | "reading" | "ready" | "processing" | "success" | "error";
