import type { TextCleanOptions } from "./types";

export const defaultTextCleanOptions: TextCleanOptions = {
  removeMultipleSpaces: true,
  removeExtraLineBreaks: true,
  trimEdges: true,
  normalizeQuotes: true,
  removeInvisibleCharacters: true,
  collapseEmptyLines: true,
};

export function cleanText(input: string, options: TextCleanOptions): string {
  let output = input.replace(/\r\n?/g, "\n");

  if (options.removeInvisibleCharacters) {
    output = output.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200D\uFEFF]/g, "");
  }

  if (options.normalizeQuotes) {
    output = output
      .replace(/[‘’‚‛]/g, "'")
      .replace(/[“”„‟]/g, '"');
  }

  if (options.removeExtraLineBreaks) {
    output = output
      .replace(/[^\S\n]+\n/g, "\n")
      .replace(/\n[^\S\n]+/g, "\n");
  }

  if (options.removeMultipleSpaces) {
    output = output.replace(/[^\S\n]{2,}/g, " ");
  }

  if (options.collapseEmptyLines) {
    output = output.replace(/\n{3,}/g, "\n\n");
  }

  if (options.trimEdges) {
    output = output.trim();
  }

  return output;
}
