export type SplitPdfMode = "extract-pages" | "parts" | "individual-pages";

export type SplitPdfStatus = "idle" | "reading" | "ready" | "processing" | "success" | "error";

export type SplitPdfMetadata = {
  fileName: string;
  fileSize: number;
  pageCount: number;
};

export type { PageSelectionResult, PartsValidationResult } from "../../../shared/utils/pageRanges";

export type SplitPdfResult = {
  bytes: ArrayBuffer;
  fileName: string;
  mimeType: "application/pdf" | "application/zip";
  outputCount: number;
  pageCount: number;
};
