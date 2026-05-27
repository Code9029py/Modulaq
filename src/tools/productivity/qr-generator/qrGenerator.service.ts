import QRCode from "qrcode";
import type {
  QrContentCopy,
  QrContentType,
  QrGenerationResult,
  QrOutputSizeResult,
  QrPresetSize,
  QrSize,
  QrValidationResult,
} from "./qrGenerator.types";

export const qrSizePixels: Record<QrPresetSize, number> = {
  small: 256,
  medium: 512,
  large: 1024,
};
export const minimumCustomQrSize = 128;
export const maximumCustomQrSize = 2048;

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

export function buildQrValue(contentType: QrContentType, input: string) {
  const trimmedInput = input.trim();

  if (contentType === "email") {
    return `mailto:${trimmedInput}`;
  }

  if (contentType === "phone") {
    return `tel:${trimmedInput.replace(/\s+/g, "")}`;
  }

  return trimmedInput;
}

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
      message: "El teléfono contiene caracteres poco habituales. Se permiten números, espacios, +, guiones y paréntesis.",
    };
  }

  return { isWarning: false, message: null };
}

export function resolveQrOutputSize(size: QrSize, customSizeInput: string): QrOutputSizeResult {
  if (size !== "custom") {
    return {
      error: null,
      pixels: qrSizePixels[size],
    };
  }

  const trimmedInput = customSizeInput.trim();

  if (!trimmedInput) {
    return {
      error: `Ingresá un tamaño entre ${minimumCustomQrSize} y ${maximumCustomQrSize} px.`,
      pixels: null,
    };
  }

  if (!/^\d+$/.test(trimmedInput)) {
    return {
      error: "Ingresá un tamaño numérico entero válido.",
      pixels: null,
    };
  }

  const pixelSize = Number(trimmedInput);

  if (pixelSize < minimumCustomQrSize) {
    return {
      error: `El tamaño mínimo es ${minimumCustomQrSize} px.`,
      pixels: null,
    };
  }

  if (pixelSize > maximumCustomQrSize) {
    return {
      error: `El tamaño máximo es ${maximumCustomQrSize} px.`,
      pixels: null,
    };
  }

  return {
    error: null,
    pixels: pixelSize,
  };
}

export async function generateQrPng(
  contentType: QrContentType,
  input: string,
  pixelSize: number,
): Promise<QrGenerationResult> {
  const value = buildQrValue(contentType, input);
  const dataUrl = await QRCode.toDataURL(value, {
    color: {
      dark: "#13202b",
      light: "#f3f7fa",
    },
    errorCorrectionLevel: "M",
    margin: 2,
    scale: 8,
    width: pixelSize,
  });

  return { dataUrl, pixelSize, value };
}
