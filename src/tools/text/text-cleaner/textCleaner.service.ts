// Adaptador delgado sobre @modulaq/core/text.
// Preserva la API histórica de la app (cleanText devuelve { output, before, after }).
import { cleanText as coreCleanText, getTextStats as coreGetTextStats } from "@modulaq/core/text";
import type { TextCleanerOptions, TextCleanerResult, TextStats } from "./textCleaner.types";

export const defaultTextCleanerOptions: TextCleanerOptions = {
  removeMultipleSpaces: true,
  removeExtraLineBreaks: true,
  trimEdges: true,
  normalizeQuotes: true,
  removeInvisibleCharacters: true,
  collapseEmptyLines: true,
};

export function cleanText(input: string, options: TextCleanerOptions): TextCleanerResult {
  const output = coreCleanText(input, options);
  return {
    output,
    before: coreGetTextStats(input),
    after: coreGetTextStats(output),
  };
}

export function getTextStats(text: string): TextStats {
  return coreGetTextStats(text);
}
