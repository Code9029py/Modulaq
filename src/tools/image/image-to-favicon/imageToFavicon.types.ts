export type FaviconIconSpec = {
  fileName: string;
  label: string;
  size: number;
};

export type ImageToFaviconMetadata = {
  fileName: string;
  fileSize: number;
  height: number;
  mimeType: string;
  width: number;
};

export type ImageToFaviconResultIcon = FaviconIconSpec & {
  byteSize: number;
};

export type ImageToFaviconResult = {
  bytes: ArrayBuffer;
  fileName: string;
  iconCount: number;
  icons: ImageToFaviconResultIcon[];
  mimeType: "application/zip";
  size: number;
};

export type ImageToFaviconOptions = {
  outputBaseName: string;
};

export type ImageToFaviconStatus = "idle" | "reading" | "ready" | "processing" | "success" | "error";

export type ImageDimensions = {
  height: number;
  width: number;
};
