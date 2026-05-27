export type MergePdfFileStatus = "reading" | "ready" | "error";

export type MergePdfStatus = "idle" | "processing" | "success" | "error";

export type MergePdfItem = {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number | null;
  status: MergePdfFileStatus;
  error: string | null;
};

export type MergePdfFileMetadata = {
  fileName: string;
  fileSize: number;
  pageCount: number;
};

export type MergePdfResult = {
  bytes: ArrayBuffer;
  fileName: string;
  pageCount: number;
};

export type MergePdfOptions = {
  outputFileName?: string;
};
