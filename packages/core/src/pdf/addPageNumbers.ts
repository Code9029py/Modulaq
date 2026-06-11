import { StandardFonts } from "pdf-lib";
import { loadPdfDocument } from "./shared";
import type { PdfInput } from "./types";

export type PageNumberPosition = "bottom-left" | "bottom-center" | "bottom-right";

export type AddPageNumbersOptions = {
  /** Posición del número. Default: "bottom-center". */
  position?: PageNumberPosition;
  /** Tamaño de fuente en puntos. Default: 11. Acepta 8..18. */
  fontSize?: number;
  /** Margen desde el borde inferior y los laterales en puntos. Default: 30. */
  margin?: number;
  /**
   * Plantilla del label. Soporta `{n}` (número visible) y `{total}` (total
   * numerado). Default: "{n} / {total}". Se valida que sea string corto para
   * no romper el layout.
   */
  template?: string;
  /**
   * Página física del PDF donde aparece el primer número (1-based). Las
   * páginas anteriores quedan sin numerar. Default: 1.
   */
  startPage?: number;
  /**
   * Número visible que se dibuja en la primera página numerada. Default: 1.
   */
  startingNumber?: number;
};

const DEFAULTS = {
  position: "bottom-center" as PageNumberPosition,
  fontSize: 11,
  margin: 30,
  template: "{n} / {total}",
  startPage: 1,
  startingNumber: 1,
};

export const ADD_PAGE_NUMBERS_STARTING_NUMBER_MAX = 9999;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value) && value >= 1;
}

/**
 * Renderiza el label de una página específica. Expuesto para tests y para que
 * los consumidores puedan previsualizar el formato sin abrir un PDF.
 */
export function formatPageNumberLabel(template: string, visibleNumber: number, total: number): string {
  return template.replace("{n}", String(visibleNumber)).replace("{total}", String(total));
}

/**
 * Agrega números de página a un PDF existente. Conserva todas las páginas y
 * dibuja el label en la posición indicada usando Helvetica embebida.
 *
 * Modelo de numeración:
 *  - `startPage`: índice físico (1-based) del PDF donde aparece el primer número.
 *    Páginas anteriores quedan sin numerar.
 *  - `startingNumber`: número visible inicial.
 *  - `visibleNumber(physical) = startingNumber + (physical - startPage)`.
 *  - `total = totalPages - startPage + 1` — sólo las páginas numeradas.
 *
 * Ejemplo: PDF de 25 páginas con startPage=2 y startingNumber=1:
 *  - página física 1: sin numeración
 *  - página física 2: "1 / 24"
 *  - página física 25: "24 / 24"
 *
 * No promete preservar formularios interactivos, firmas digitales o
 * anotaciones complejas: pdf-lib re-serializa el documento y algunos
 * artefactos pueden perderse o cambiar de offset.
 */
export async function addPageNumbers(input: PdfInput, options: AddPageNumbersOptions = {}): Promise<Uint8Array> {
  const position = options.position ?? DEFAULTS.position;
  const fontSize = clamp(options.fontSize ?? DEFAULTS.fontSize, 8, 18);
  const margin = clamp(options.margin ?? DEFAULTS.margin, 8, 96);
  const template = (options.template ?? DEFAULTS.template).slice(0, 64);

  const pdf = await loadPdfDocument(input);
  const totalPages = pdf.getPageCount();

  const startPage = options.startPage ?? DEFAULTS.startPage;
  const startingNumber = options.startingNumber ?? DEFAULTS.startingNumber;
  if (!isPositiveInteger(startPage)) {
    throw new Error("addPageNumbers startPage must be a positive integer.");
  }
  if (startPage > totalPages) {
    throw new Error("addPageNumbers startPage must be <= total pages.");
  }
  if (!isPositiveInteger(startingNumber)) {
    throw new Error("addPageNumbers startingNumber must be a positive integer.");
  }
  if (startingNumber > ADD_PAGE_NUMBERS_STARTING_NUMBER_MAX) {
    throw new Error(
      `addPageNumbers startingNumber must be <= ${ADD_PAGE_NUMBERS_STARTING_NUMBER_MAX}.`,
    );
  }

  const numberedTotal = totalPages - startPage + 1;
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();

  pages.forEach((page, index) => {
    const physical = index + 1;
    if (physical < startPage) return;
    const visibleNumber = startingNumber + (physical - startPage);
    const label = formatPageNumberLabel(template, visibleNumber, numberedTotal);
    const labelWidth = font.widthOfTextAtSize(label, fontSize);
    const { width } = page.getSize();

    let x: number;
    if (position === "bottom-left") {
      x = margin;
    } else if (position === "bottom-right") {
      x = width - margin - labelWidth;
    } else {
      x = (width - labelWidth) / 2;
    }

    page.drawText(label, {
      x,
      y: margin,
      size: fontSize,
      font,
    });
  });

  return pdf.save();
}
