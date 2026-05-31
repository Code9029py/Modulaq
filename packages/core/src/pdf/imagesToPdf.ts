import { PDFDocument, type PDFImage } from "pdf-lib";

/**
 * Entrada aceptada por `imagesToPdf`.
 * - `File`/`Blob`: el SDK detecta PNG/JPG por `type` o extensión del nombre.
 * - Objeto `{ bytes, format }`: el consumidor declara el formato explícitamente
 *   (útil cuando ya convertiste el contenido — por ejemplo, WebP → PNG en canvas).
 */
export type ImageInput =
  | File
  | Blob
  | { bytes: Uint8Array | ArrayBuffer; format: "png" | "jpg" };

const A4_PORTRAIT: readonly [number, number] = [595.28, 841.89];
const A4_LANDSCAPE: readonly [number, number] = [841.89, 595.28];
const PAGE_MARGIN = 36;

function detectFormatFromFile(file: File): "png" | "jpg" | null {
  const name = file.name.toLowerCase();
  if (file.type === "image/png" || name.endsWith(".png")) {
    return "png";
  }
  if (file.type === "image/jpeg" || name.endsWith(".jpg") || name.endsWith(".jpeg")) {
    return "jpg";
  }
  return null;
}

async function blobToBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

async function embedImage(pdf: PDFDocument, input: ImageInput): Promise<PDFImage> {
  if (input instanceof Blob) {
    const file = input as File;
    const format = "name" in file && "type" in file
      ? detectFormatFromFile(file)
      : null;
    if (!format) {
      throw new Error("imagesToPdf: el archivo no es PNG ni JPG.");
    }
    const bytes = await blobToBytes(input);
    return format === "png" ? pdf.embedPng(bytes) : pdf.embedJpg(bytes);
  }

  const bytes = input.bytes instanceof Uint8Array ? input.bytes : new Uint8Array(input.bytes);
  return input.format === "png" ? pdf.embedPng(bytes) : pdf.embedJpg(bytes);
}

function getPageSize(image: PDFImage): readonly [number, number] {
  return image.width >= image.height ? A4_LANDSCAPE : A4_PORTRAIT;
}

/**
 * Genera un PDF colocando cada imagen como una página A4 (orientación según
 * relación de aspecto), centrada y con margen.
 *
 * Soporta PNG y JPG. Otros formatos (p. ej. WebP) deben convertirse a PNG/JPG
 * antes de pasarlos (la conversión requiere `canvas` y queda fuera del SDK).
 */
export async function imagesToPdf(images: ImageInput[]): Promise<Uint8Array> {
  if (images.length === 0) {
    throw new Error("imagesToPdf requires at least one image.");
  }

  const pdf = await PDFDocument.create();
  for (const image of images) {
    const embedded = await embedImage(pdf, image);
    const [pageWidth, pageHeight] = getPageSize(embedded);
    const page = pdf.addPage([pageWidth, pageHeight]);

    const maxWidth = pageWidth - PAGE_MARGIN * 2;
    const maxHeight = pageHeight - PAGE_MARGIN * 2;
    const scale = Math.min(maxWidth / embedded.width, maxHeight / embedded.height);
    const drawWidth = embedded.width * scale;
    const drawHeight = embedded.height * scale;

    page.drawImage(embedded, {
      x: (pageWidth - drawWidth) / 2,
      y: (pageHeight - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });
  }

  return pdf.save();
}
