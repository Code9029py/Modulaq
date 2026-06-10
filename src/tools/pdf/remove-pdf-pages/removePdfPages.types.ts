export type RemovePdfPagesStatus = "idle" | "reading" | "ready" | "processing" | "success" | "error";

export type RemovePdfPagesMetadata = {
  fileName: string;
  fileSize: number;
  pageCount: number;
};

export type RemovePdfPagesResult = {
  bytes: ArrayBuffer;
  fileName: string;
  removedCount: number;
  remainingCount: number;
};
