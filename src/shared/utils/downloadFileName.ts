// Capa de compatibilidad sobre @modulaq/core/files.
// Los nombres históricos de la app se mantienen para no obligar a los services
// no migrados (compress-pdf, extract-pdf-text, pdf-to-images) y a los Tool components
// a cambiar sus imports.
//
// La lógica vive en el SDK; este archivo expone alias estables.
import {
  ensureFileExtension,
  getBaseFileName,
  sanitizeFileName,
} from "@modulaq/core/files";

export { getBaseFileName };
export type { DownloadExtension } from "@modulaq/core/files";

export const sanitizeDownloadBaseName = sanitizeFileName;
export const buildDownloadFileName = ensureFileExtension;

/**
 * Sugiere un nombre de salida a partir del nombre original del archivo.
 * No está en el SDK porque es una conveniencia específica de las herramientas
 * de Modulaq Web (compone `getBaseFileName` + `sanitizeFileName`).
 */
export function getSuggestedDownloadBaseName(fileName: string, fallbackBaseName: string) {
  return sanitizeFileName(getBaseFileName(fileName), fallbackBaseName);
}
