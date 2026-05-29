// Adaptador delgado sobre @modulaq/core/qr.
// Preserva la API histórica que el componente espera:
//   generateQrPng(contentType, input, pixelSize): Promise<QrGenerationResult>
//   qrContentCopy (UI copy en español; queda en la app porque es contenido visual).
import {
  buildQrValue,
  generateQrDataUrl,
  maximumCustomQrSize,
  minimumCustomQrSize,
  qrSizePixels,
  resolveQrOutputSize,
  validateQrInput,
} from "@modulaq/core/qr";
import type {
  QrContentCopy,
  QrContentType,
  QrGenerationResult,
} from "./qrGenerator.types";

export { buildQrValue, validateQrInput, resolveQrOutputSize };
export { qrSizePixels, minimumCustomQrSize, maximumCustomQrSize };

export const qrContentCopy: Record<QrContentType, QrContentCopy> = {
  text: {
    label: "Texto libre",
    placeholder: "Escribe el texto que quieras convertir en QR...",
    help: "Ideal para frases, instrucciones breves o información simple.",
  },
  url: {
    label: "URL",
    placeholder: "https://modulaq.dev",
    help: "Usá enlaces completos para que el QR abra correctamente en el lector.",
  },
  email: {
    label: "Email",
    placeholder: "nombre@dominio.com",
    help: "El QR abrirá un nuevo correo dirigido a esa dirección.",
  },
  phone: {
    label: "Teléfono",
    placeholder: "+595 981 000 000",
    help: "Acepta números, espacios, +, guiones y paréntesis.",
  },
};

export async function generateQrPng(
  contentType: QrContentType,
  input: string,
  pixelSize: number,
): Promise<QrGenerationResult> {
  const value = buildQrValue(contentType, input);
  const dataUrl = await generateQrDataUrl(value, { size: pixelSize });
  return { dataUrl, pixelSize, value };
}
