import QRCode from "qrcode";
import type { QrOptions } from "./types";

const defaults: Required<QrOptions> = {
  size: 512,
  margin: 2,
  errorCorrection: "M",
  dark: "#13202b",
  light: "#f3f7fa",
  scale: 8,
};

/**
 * Genera un código QR como data URL PNG a partir del valor a codificar.
 * El consumidor decide cómo construir ese valor (ver `buildQrValue`).
 *
 * Defaults pensados para coincidir con el comportamiento histórico de Modulaq Web.
 */
export async function generateQrDataUrl(value: string, options: QrOptions = {}): Promise<string> {
  const config = { ...defaults, ...options };

  return QRCode.toDataURL(value, {
    color: {
      dark: config.dark,
      light: config.light,
    },
    errorCorrectionLevel: config.errorCorrection,
    margin: config.margin,
    scale: config.scale,
    width: config.size,
  });
}
