export type CompressPdfStatus = "idle" | "reading" | "ready" | "processing" | "success" | "error";

export type CompressPdfItemStatus = "ready" | "processing" | "success" | "error";

export type CompressPdfMetadata = {
  fileName: string;
  fileSize: number;
  pageCount: number;
};

export type CompressPdfResult = {
  bytes: ArrayBuffer;
  fileName: string;
  originalSize: number;
  outputSize: number;
  savedBytes: number;
  reductionPercentage: number;
  pageCount: number;
  isSmaller: boolean;
  hasSignificantReduction: boolean;
  preservedOriginal: boolean;
};

export type CompressPdfDownload = {
  bytes: ArrayBuffer;
  fileName: string;
  mimeType: "application/pdf" | "application/zip";
  outputCount: number;
};
