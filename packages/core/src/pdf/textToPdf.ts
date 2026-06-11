import { PDFDocument, StandardFonts } from "pdf-lib";

/**
 * Genera un PDF a partir de texto plano. Soporta título opcional, tamaño de
 * fuente, márgenes y familia tipográfica configurables (entre las fuentes
 * estándar de pdf-lib), y paginación automática con word-wrap.
 *
 * Sin imágenes, sin tablas, sin markdown. Si necesitás algo más rico, considerá
 * otra ruta.
 */

export type TextToPdfPageSize = "a4" | "letter" | "legal";

export type TextToPdfFontFamily = "helvetica" | "times-roman" | "courier";

export type TextToPdfOptions = {
  /** Título opcional renderizado como encabezado destacado de la primera página. */
  title?: string;
  /** Tamaño de fuente del cuerpo en puntos. Default: 11. Rango aceptado 8..32. */
  fontSize?: number;
  /** Margen en puntos para los 4 lados. Default: 56 (~2 cm). Acepta 24..120. */
  margin?: number;
  /** Tamaño de página. Default: "a4". */
  pageSize?: TextToPdfPageSize;
  /** Familia tipográfica. Default: "helvetica". */
  fontFamily?: TextToPdfFontFamily;
};

const PAGE_SIZES: Record<TextToPdfPageSize, { width: number; height: number }> = {
  // Dimensiones estándar en puntos PostScript (1pt = 1/72 in).
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
  // Legal / Oficio US: 8.5 x 14 in.
  legal: { width: 612, height: 1008 },
};

const FONT_PAIRS: Record<TextToPdfFontFamily, { regular: StandardFonts; bold: StandardFonts }> = {
  helvetica: { regular: StandardFonts.Helvetica, bold: StandardFonts.HelveticaBold },
  "times-roman": { regular: StandardFonts.TimesRoman, bold: StandardFonts.TimesRomanBold },
  courier: { regular: StandardFonts.Courier, bold: StandardFonts.CourierBold },
};

export const TEXT_TO_PDF_FONT_SIZE_MIN = 8;
export const TEXT_TO_PDF_FONT_SIZE_MAX = 32;

const DEFAULTS = {
  fontSize: 11,
  margin: 56,
  pageSize: "a4" as TextToPdfPageSize,
  fontFamily: "helvetica" as TextToPdfFontFamily,
};

const TITLE_GAP = 18;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function isValidFontSize(value: number): boolean {
  return (
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= TEXT_TO_PDF_FONT_SIZE_MIN &&
    value <= TEXT_TO_PDF_FONT_SIZE_MAX
  );
}

/**
 * Wrap por palabras. Usa la medición real de la fuente para no cortar líneas
 * antes de tiempo. Palabras sueltas más anchas que la columna se dejan en su
 * línea (sin partir caracteres) — preferible a inflar la complejidad con
 * hyphenation.
 */
function wrapLine(
  line: string,
  font: import("pdf-lib").PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  if (line.length === 0) return [""];
  const words = line.split(/\s+/).filter((word) => word.length > 0);
  if (words.length === 0) return [""];
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current.length === 0 ? word : `${current} ${word}`;
    const width = font.widthOfTextAtSize(candidate, fontSize);
    if (width <= maxWidth || current.length === 0) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current.length > 0) lines.push(current);
  return lines;
}

export async function textToPdf(text: string, options: TextToPdfOptions = {}): Promise<Uint8Array> {
  const trimmed = text.replace(/\r\n/g, "\n");
  if (trimmed.trim().length === 0) {
    throw new Error("textToPdf requires non-empty text.");
  }

  const requestedFontSize = options.fontSize ?? DEFAULTS.fontSize;
  if (!isValidFontSize(requestedFontSize)) {
    throw new Error(
      `textToPdf fontSize must be an integer between ${TEXT_TO_PDF_FONT_SIZE_MIN} and ${TEXT_TO_PDF_FONT_SIZE_MAX}.`,
    );
  }
  const fontSize = requestedFontSize;

  const margin = clamp(options.margin ?? DEFAULTS.margin, 24, 120);
  const pageSizeKey = options.pageSize ?? DEFAULTS.pageSize;
  const pageSize = PAGE_SIZES[pageSizeKey];
  const fontFamily = options.fontFamily ?? DEFAULTS.fontFamily;
  const fontPair = FONT_PAIRS[fontFamily];
  const title = options.title?.trim() ?? "";

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(fontPair.regular);
  const titleFont = await pdf.embedFont(fontPair.bold);
  const titleSize = clamp(fontSize + 6, fontSize, 36);
  const lineHeight = fontSize * 1.4;

  const usableWidth = pageSize.width - margin * 2;
  const contentTop = pageSize.height - margin;
  const contentBottom = margin;

  let page = pdf.addPage([pageSize.width, pageSize.height]);
  let cursorY = contentTop;

  const ensureSpace = (need: number) => {
    if (cursorY - need < contentBottom) {
      page = pdf.addPage([pageSize.width, pageSize.height]);
      cursorY = contentTop;
    }
  };

  if (title.length > 0) {
    const wrappedTitle = wrapLine(title, titleFont, titleSize, usableWidth);
    for (const titleLine of wrappedTitle) {
      ensureSpace(titleSize);
      page.drawText(titleLine, {
        x: margin,
        y: cursorY - titleSize,
        size: titleSize,
        font: titleFont,
      });
      cursorY -= titleSize * 1.25;
    }
    cursorY -= TITLE_GAP;
  }

  const sourceLines = trimmed.split("\n");
  for (const sourceLine of sourceLines) {
    const wrapped = wrapLine(sourceLine, font, fontSize, usableWidth);
    for (const wrappedLine of wrapped) {
      ensureSpace(lineHeight);
      page.drawText(wrappedLine, {
        x: margin,
        y: cursorY - fontSize,
        size: fontSize,
        font,
      });
      cursorY -= lineHeight;
    }
  }

  return pdf.save();
}
