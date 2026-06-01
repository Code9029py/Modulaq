// Reuso del tipo de entrada binaria del subpath /pdf para no duplicarlo.
// El consumidor puede pasar File/Blob/ArrayBuffer/Uint8Array.
export type { PdfInput } from "../pdf/types";

export type ExtractedPdfText = {
  /** Texto de cada página, en el orden del documento. */
  pages: string[];
  /** Concatenación de todas las páginas separadas por una línea en blanco. */
  text: string;
};

export type PdfImageFormat = "png" | "jpeg";

export type PdfToImagesOptions = {
  /** Páginas a renderizar (1-based). Default: todas las páginas del documento. */
  pages?: number[];
  /** Factor de escala respecto al tamaño nativo del PDF. Default: 2 (alta calidad). */
  scale?: number;
  /** Formato del binario de salida. Default: "png". */
  format?: PdfImageFormat;
  /** Calidad JPEG (0..1). Solo aplica si `format === "jpeg"`. Default: 0.92. */
  quality?: number;
  /**
   * Escape hatch: factory que devuelve un `HTMLCanvasElement` (o compatible).
   * Default: `document.createElement("canvas")`. Pasar este parámetro permite
   * usar `OffscreenCanvas`, polyfills (Node) u otros backends sin romper la API.
   */
  createCanvas?: () => HTMLCanvasElement;
};

export type PdfPageImage = {
  /** Número de página (1-based) que originó esta imagen. */
  pageNumber: number;
  /** Bytes del PNG o JPEG generado. */
  bytes: Uint8Array;
  /** Ancho en píxeles del canvas usado para renderizar. */
  width: number;
  /** Alto en píxeles del canvas usado para renderizar. */
  height: number;
};
