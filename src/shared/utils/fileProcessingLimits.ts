const megabyte = 1024 * 1024;

export const fileProcessingLimits = {
  maxPdfFileSizeBytes: 50 * megabyte,
  maxTotalPdfSizeBytes: 100 * megabyte,
  maxImageFileCount: 30,
  maxImageFileSizeBytes: 15 * megabyte,
  maxTotalImageSizeBytes: 100 * megabyte,
  maxGeneratedPageFiles: 50,
} as const;

export const fileProcessingLimitLabels = {
  pdfSingle: "Máximo: 50 MB por PDF.",
  pdfMultiple: "Máximo: 50 MB por PDF y 100 MB en total.",
  images: "Máximo: 30 imágenes, 15 MB por imagen y 100 MB en total.",
  pdfToImages: "Máximo: 50 MB por PDF y hasta 50 páginas por conversión.",
  splitPdf: "Máximo: 50 MB por PDF y hasta 50 páginas en Separar todas.",
} as const;

export function getPdfFileSizeLimitError(file: File) {
  return file.size > fileProcessingLimits.maxPdfFileSizeBytes
    ? `"${file.name}" supera el límite de 50 MB para procesarlo localmente.`
    : null;
}

export function getTotalPdfSizeLimitError(totalSizeBytes: number) {
  return totalSizeBytes > fileProcessingLimits.maxTotalPdfSizeBytes
    ? "La selección supera el límite total de 100 MB para PDFs."
    : null;
}

export function getImageFileSizeLimitError(file: File) {
  return file.size > fileProcessingLimits.maxImageFileSizeBytes
    ? `"${file.name}" supera el límite de 15 MB por imagen.`
    : null;
}

export function getTotalImageSizeLimitError(totalSizeBytes: number) {
  return totalSizeBytes > fileProcessingLimits.maxTotalImageSizeBytes
    ? "La selección supera el límite total de 100 MB para imágenes."
    : null;
}

export function getImageCountLimitError(imageCount: number) {
  return imageCount > fileProcessingLimits.maxImageFileCount
    ? "Podés cargar hasta 30 imágenes por PDF."
    : null;
}

export function getGeneratedPageFilesLimitError(outputCount: number, outputLabel: string) {
  return outputCount > fileProcessingLimits.maxGeneratedPageFiles
    ? `Podés ${outputLabel} hasta 50 páginas por operación para evitar bloquear el navegador.`
    : null;
}
