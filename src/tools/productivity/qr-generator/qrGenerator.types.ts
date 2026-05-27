export type QrContentType = "text" | "url" | "email" | "phone";

export type QrPresetSize = "small" | "medium" | "large";

export type QrSize = QrPresetSize | "custom";

export type QrGeneratorConfig = {
  contentType: QrContentType;
  customSizeInput: string;
  input: string;
  size: QrSize;
};

export type QrContentCopy = {
  help: string;
  label: string;
  placeholder: string;
};

export type QrValidationResult = {
  isWarning: boolean;
  message: string | null;
};

export type QrOutputSizeResult = {
  error: string | null;
  pixels: number | null;
};

export type QrGenerationResult = {
  dataUrl: string;
  pixelSize: number;
  value: string;
};
