const megabyte = 1024 * 1024;

/**
 * Límites numéricos del procesamiento local. Los labels visibles y los
 * mensajes de error se resuelven vía `useFileProcessingLimitLabels()`
 * (renderers) o `check*` helpers en `src/shared/errors` (services).
 */
export const fileProcessingLimits = {
  maxPdfFileSizeBytes: 50 * megabyte,
  maxTotalPdfSizeBytes: 100 * megabyte,
  maxImageFileCount: 30,
  maxImageFileSizeBytes: 15 * megabyte,
  maxTotalImageSizeBytes: 100 * megabyte,
  maxGeneratedPageFiles: 50,
} as const;
