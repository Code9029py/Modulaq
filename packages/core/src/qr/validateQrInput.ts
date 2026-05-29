import type { QrContentType, QrValidationResult } from "./types";

/**
 * Valida el input del usuario según el tipo de contenido del QR.
 * Devuelve un resultado con `isWarning` y un mensaje opcional, sin lanzar.
 */
export function validateQrInput(contentType: QrContentType, input: string): QrValidationResult {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return { isWarning: false, message: null };
  }

  if (contentType === "url" && !/^https?:\/\/[^\s]+\.[^\s]+/i.test(trimmedInput)) {
    return {
      isWarning: true,
      message: "La URL no parece completa. Probá incluir https:// y un dominio válido.",
    };
  }

  if (contentType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInput)) {
    return {
      isWarning: true,
      message: "El correo no parece tener un formato válido.",
    };
  }

  if (contentType === "phone" && !/^[+\d\s()-]+$/.test(trimmedInput)) {
    return {
      isWarning: true,
      message:
        "El teléfono contiene caracteres poco habituales. Se permiten números, espacios, +, guiones y paréntesis.",
    };
  }

  return { isWarning: false, message: null };
}
