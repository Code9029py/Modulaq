// Reuso del tipo de entrada binaria del subpath /pdf para no duplicarlo.
// El consumidor puede pasar File/Blob/ArrayBuffer/Uint8Array.
export type { PdfInput } from "../pdf/types";

export type ExtractedPdfText = {
  /** Texto de cada página, en el orden del documento. */
  pages: string[];
  /** Concatenación de todas las páginas separadas por una línea en blanco. */
  text: string;
};
