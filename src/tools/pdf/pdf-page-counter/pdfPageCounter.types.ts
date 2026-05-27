export type PdfPageCountResult = {
  fileName: string;
  fileSize: number;
  pageCount: number;
};

export type PdfPageCounterStatus = "idle" | "processing" | "success" | "error";
