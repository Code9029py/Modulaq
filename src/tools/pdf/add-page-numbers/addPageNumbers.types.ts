export type AddPageNumbersStatus = "idle" | "reading" | "ready" | "processing" | "success" | "error";

export type PageNumberPosition = "bottom-left" | "bottom-center" | "bottom-right";

export type PageNumberFormatPreset =
  | "n"
  | "n-of-total"
  | "page-n"
  | "page-n-of-total"
  | "pag-n"
  | "pag-n-of-total";

export type AddPageNumbersMetadata = {
  fileName: string;
  fileSize: number;
  pageCount: number;
};

export type AddPageNumbersResult = {
  bytes: ArrayBuffer;
  fileName: string;
  pageCount: number;
  numberedPages: number;
};

export type AddPageNumbersFormOptions = {
  position: PageNumberPosition;
  format: PageNumberFormatPreset;
  startPage: number;
  startingNumber: number;
};
