import type { QrOutputSizeResult, QrPresetSize, QrSize } from "./types";

export const qrSizePixels: Record<QrPresetSize, number> = {
  small: 256,
  medium: 512,
  large: 1024,
};

export const minimumCustomQrSize = 128;
export const maximumCustomQrSize = 2048;

/**
 * Resuelve el tamaño final del QR en píxeles a partir del preset o de un input personalizado.
 * Devuelve `{ pixels, error }`; si hay error, `pixels` es `null`.
 */
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
