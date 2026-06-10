import { PDFDocument, StandardFonts } from "pdf-lib";

/**
 * Genera un PDF a partir de texto plano. Soporta título opcional, tamaño de
 * fuente y margen configurables, y paginación automática con word-wrap.
 *
 * Stack chico: Helvetica (StandardFonts, no embed), A4 portrait, sin imágenes,
 * sin tablas, sin markdown. Si necesitás algo más rico, considerá otra ruta.
 */

export type TextToPdfPageSize = "a4" | "letter";

export type TextToPdfOptions = {
  /** Título opcional renderizado en el header de la primera página. */
  title?: string;
  /** Tamaño de fuente del cuerpo en puntos. Default: 12. Acepta 8..24. */
  fontSize?: number;
  /** Margen en puntos para los 4 lados. Default: 56 (~2 cm). Acepta 24..120. */
  margin?: number;
  /** Tamaño de página. Default: "a4". */
  pageSize?: TextToPdfPageSize;
};

const PAGE_SIZES: Record<TextToPdfPageSize, { width: number; height: number }> = {
  // Dimensiones estándar en puntos PostScript (1pt = 1/72 in).
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
};

const DEFAULTS = {
  fontSize: 12,
  margin: 56,
  pageSize: "a4" as TextToPdfPageSize,
};

const TITLE_GAP = 18;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Wrap por palabras. Usa la medición real de la fuente para no cortar líneas
 * antes de tiempo. Cuando una palabra suelta excede el ancho disponible, se
 * deja en su línea (sin partir caracteres) y el caller verá el desborde —
 * es preferible eso a inflar la complejidad con hyphenation.
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

  const fontSize = clamp(options.fontSize ?? DEFAULTS.fontSize, 8, 24);
  const margin = clamp(options.margin ?? DEFAULTS.margin, 24, 120);
  const pageSize = PAGE_SIZES[options.pageSize ?? DEFAULTS.pageSize];
  const title = options.title?.trim() ?? "";

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const titleSize = clamp(fontSize + 6, fontSize, 28);
  const lineHeight = fontSize * 1.4;

  const usableWidth = pageSize.width - margin * 2;
  const contentTop = pageSize.height - margin;
  const contentBottom = margin;

  let page = pdf.addPage([pageSize.width, pageSize.height]);
  let cursorY = contentTop;
  let isFirstPage = true;

  const ensureSpace = (need: number) => {
    if (cursorY - need < contentBottom) {
      page = pdf.addPage([pageSize.width, pageSize.height]);
      cursorY = contentTop;
      isFirstPage = false;
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

  // Marker no-op para evitar warning de unused-var en algunos linters.
  void isFirstPage;

  return pdf.save();
}
