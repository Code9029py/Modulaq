import { degrees } from "pdf-lib";
import { loadPdfDocument } from "./shared";
import type { PdfInput } from "./types";

export type PdfRotation = 90 | 180 | 270;

const VALID_ROTATIONS: readonly number[] = [90, 180, 270];

/**
 * Rota todas las páginas de un PDF en el ángulo indicado (90/180/270, en
 * sentido horario) y devuelve el documento resultante.
 *
 * Reglas:
 *  - La rotación se suma a la rotación existente de cada página (módulo 360),
 *    para respetar PDFs que ya traen páginas rotadas en su metadata.
 *  - Ángulos fuera de {90, 180, 270} lanzan error: el caller valida la UI,
 *    pero el SDK no debe aceptar rotaciones que pdf-lib no normaliza.
 */
export async function rotatePdfPages(input: PdfInput, rotation: PdfRotation): Promise<Uint8Array> {
  if (!VALID_ROTATIONS.includes(rotation)) {
    throw new Error("rotatePdfPages only supports 90, 180 or 270 degree rotations.");
  }

  const document = await loadPdfDocument(input);
  for (const page of document.getPages()) {
    const currentAngle = page.getRotation().angle;
    const nextAngle = ((currentAngle + rotation) % 360 + 360) % 360;
    page.setRotation(degrees(nextAngle));
  }
  return document.save();
}
