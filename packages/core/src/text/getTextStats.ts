import type { TextStats } from "./types";

/**
 * Devuelve caracteres totales, palabras y líneas de un texto.
 * Normaliza saltos de línea CR/CRLF antes de contar.
 */
export function getTextStats(text: string): TextStats {
  const normalizedText = text.replace(/\r\n?/g, "\n");
  const trimmedText = normalizedText.trim();

  return {
    characters: text.length,
    words: trimmedText.length === 0 ? 0 : trimmedText.split(/\s+/u).length,
    lines: normalizedText.length === 0 ? 0 : normalizedText.split("\n").length,
  };
}
