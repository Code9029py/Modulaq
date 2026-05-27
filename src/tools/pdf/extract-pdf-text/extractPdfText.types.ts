export type ExtractPdfTextStatus = "idle" | "reading" | "ready" | "processing" | "success" | "error";

export type ExtractPdfTextMetadata = {
  fileName: string;
  fileSize: number;
  pageCount: number;
};

export type ExtractPdfTextProgress = {
  current: number;
  total: number;
};

export type ExtractPdfTextOptions = {
  preserveApproximateLineBreaks: boolean;
};

export type ExtractedPdfPage = {
  pageNumber: number;
  text: string;
};

export type ExtractPdfTextResult = {
  text: string;
  fileName: string;
  pageCount: number;
  pagesWithText: number;
  hasSelectableText: boolean;
  likelyScanned: boolean;
  hasProblematicSymbols: boolean;
  problematicSymbolCount: number;
};
