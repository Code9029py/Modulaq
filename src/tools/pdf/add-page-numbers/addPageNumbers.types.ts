export type AddPageNumbersStatus = "idle" | "reading" | "ready" | "processing" | "success" | "error";

export type PageNumberPosition = "bottom-left" | "bottom-center" | "bottom-right";

export type AddPageNumbersMetadata = {
  fileName: string;
  fileSize: number;
  pageCount: number;
};

export type AddPageNumbersResult = {
  bytes: ArrayBuffer;
  fileName: string;
  pageCount: number;
};

export type AddPageNumbersFormOptions = {
  position: PageNumberPosition;
};
