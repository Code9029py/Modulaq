export type TextToPdfStatus = "idle" | "processing" | "success" | "error";

export type TextToPdfPageSize = "a4" | "letter" | "legal";

export type TextToPdfFontFamily = "helvetica" | "times-roman" | "courier";

export type TextToPdfFormOptions = {
  title: string;
  /** Tamaño de fuente en puntos. Entero entre 8 y 32. */
  fontSize: number;
  margin: number;
  pageSize: TextToPdfPageSize;
  fontFamily: TextToPdfFontFamily;
};

export type TextToPdfResult = {
  bytes: ArrayBuffer;
  fileName: string;
  pageCount: number;
};
