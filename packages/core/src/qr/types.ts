export type QrContentType = "text" | "url" | "email" | "phone";

export type QrPresetSize = "small" | "medium" | "large";

export type QrSize = QrPresetSize | "custom";

export type QrValidationResult = {
  isWarning: boolean;
  message: string | null;
};

export type QrOutputSizeResult = {
  error: string | null;
  pixels: number | null;
};

export type QrErrorCorrection = "L" | "M" | "Q" | "H";

export type QrOptions = {
  /** Ancho del PNG en píxeles. Default: 512. */
  size?: number;
  /** Margen alrededor del QR (módulos). Default: 2. */
  margin?: number;
  /** Nivel de corrección de errores. Default: "M". */
  errorCorrection?: QrErrorCorrection;
  /** Color de los módulos oscuros. Default: "#13202b". */
  dark?: string;
  /** Color del fondo. Default: "#f3f7fa". */
  light?: string;
  /** Escala interna que usa qrcode al rasterizar. Default: 8. */
  scale?: number;
};
