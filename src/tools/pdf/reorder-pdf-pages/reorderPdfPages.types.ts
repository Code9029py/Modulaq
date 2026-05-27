export type ReorderPdfPagesStatus = "idle" | "reading" | "ready" | "processing" | "success" | "error";

export type ReorderPdfPagesMetadata = {
  fileName: string;
  fileSize: number;
  pageCount: number;
};

export type ReorderPdfPagesResult = {
  bytes: ArrayBuffer;
  fileName: string;
  pageCount: number;
};
