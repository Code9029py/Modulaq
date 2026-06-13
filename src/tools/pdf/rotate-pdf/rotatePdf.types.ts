import type { PdfRotation } from "@modulaq/core/pdf";

export type RotatePdfStatus = "idle" | "reading" | "ready" | "processing" | "success" | "error";

export type RotatePdfMetadata = {
  fileName: string;
  fileSize: number;
  pageCount: number;
};

export type RotatePdfResult = {
  bytes: ArrayBuffer;
  fileName: string;
  pageCount: number;
  rotation: PdfRotation;
};
