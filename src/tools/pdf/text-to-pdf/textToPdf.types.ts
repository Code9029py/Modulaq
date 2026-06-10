export type TextToPdfStatus = "idle" | "processing" | "success" | "error";

export type TextToPdfPageSize = "a4" | "letter";

export type TextToPdfFormOptions = {
  title: string;
  fontSize: number;
  margin: number;
  pageSize: TextToPdfPageSize;
};

export type TextToPdfResult = {
  bytes: ArrayBuffer;
  fileName: string;
  pageCount: number;
};
