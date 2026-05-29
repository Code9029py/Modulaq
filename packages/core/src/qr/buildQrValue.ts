import type { QrContentType } from "./types";

/**
 * Construye el valor que se codifica en el QR según el tipo de contenido.
 * - email → `mailto:<input>`
 * - phone → `tel:<input sin espacios>`
 * - text/url → input recortado
 */
export function buildQrValue(contentType: QrContentType, input: string): string {
  const trimmedInput = input.trim();

  if (contentType === "email") {
    return `mailto:${trimmedInput}`;
  }

  if (contentType === "phone") {
    return `tel:${trimmedInput.replace(/\s+/g, "")}`;
  }

  return trimmedInput;
}
