import type { DownloadExtension } from "./types";
import { sanitizeFileName } from "./sanitizeFileName";

/**
 * Devuelve un nombre de archivo saneado con la extensión solicitada.
 * Usa `fallback` si el nombre queda vacío tras sanear.
 */
export function ensureFileExtension(
  name: string,
  extension: DownloadExtension,
  fallback = "archivo",
): string {
  return `${sanitizeFileName(name, fallback)}.${extension}`;
}
