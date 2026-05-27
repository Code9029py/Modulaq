export type SupportedImageMimeType = "image/png" | "image/jpeg" | "image/webp";

export type ImageToPdfItem = {
  id: string;
  file: File;
  name: string;
  previewUrl: string;
  size: number;
  type: SupportedImageMimeType;
};

export type ImageToPdfResult = {
  bytes: ArrayBuffer;
  fileName: string;
  pageCount: number;
};

export type ImageToPdfStatus = "idle" | "processing" | "success" | "error";

export type CreateImageToPdfOptions = {
  outputFileName?: string;
};
