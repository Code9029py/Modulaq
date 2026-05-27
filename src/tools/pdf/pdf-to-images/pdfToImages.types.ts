export type PdfToImagesMode = "all-pages" | "page-range";

export type PdfToImagesStatus = "idle" | "reading" | "ready" | "processing" | "success" | "error";

export type PdfToImagesMetadata = {
  fileName: string;
  fileSize: number;
  pageCount: number;
};

export type PdfPageRangeResult = {
  duplicatesRemoved: boolean;
  error: string | null;
  pages: number[];
};

export type PdfToImagesProgress = {
  current: number;
  total: number;
};

export type PdfToImagesResult = {
  bytes: ArrayBuffer;
  fileName: string;
  imageCount: number;
  mimeType: "image/png" | "application/zip";
};
