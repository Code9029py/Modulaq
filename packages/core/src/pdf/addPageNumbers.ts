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
   * Plantilla del label. Soporta {n} y {total}. Default: "{n} / {total}".
   * Se valida que sea string corto para no romper el layout.
   */
  template?: string;
};

const DEFAULTS = {
  position: "bottom-center" as PageNumberPosition,
  fontSize: 11,
  margin: 30,
  template: "{n} / {total}",
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Agrega números de página a un PDF existente. Conserva todas las páginas y
 * dibuja el label en la posición indicada usando Helvetica embebida.
 *
 * No promete preservar formularios interactivos, firmas digitales o anotaciones
 * complejas: pdf-lib re-serializa el documento y algunos artefactos pueden
 * perderse o cambiar de offset. Caller debe validar el caso de uso.
 */
export async function addPageNumbers(input: PdfInput, options: AddPageNumbersOptions = {}): Promise<Uint8Array> {
  const position = options.position ?? DEFAULTS.position;
  const fontSize = clamp(options.fontSize ?? DEFAULTS.fontSize, 8, 18);
  const margin = clamp(options.margin ?? DEFAULTS.margin, 8, 96);
  const template = (options.template ?? DEFAULTS.template).slice(0, 32);

  const pdf = await loadPdfDocument(input);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  const total = pages.length;

  pages.forEach((page, index) => {
    const pageNumber = index + 1;
    const label = template.replace("{n}", String(pageNumber)).replace("{total}", String(total));
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
