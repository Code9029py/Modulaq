import type { TextAnalysis, TextAnalysisOptions } from "./types";

const DEFAULT_WPM = 200;
const SENTENCE_TERMINATORS = /[.!?…]+/g;

function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  // Split on whitespace; punctuation stays attached to tokens but each token is
  // a single "word". This matches what most editors report.
  return trimmed.split(/\s+/u).length;
}

function countSentences(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  const matches = trimmed.match(SENTENCE_TERMINATORS);
  if (!matches) return 1;
  // Si el último token no termina con un terminator, suma como frase pendiente.
  const endsWithTerminator = SENTENCE_TERMINATORS.test(trimmed.slice(-1));
  SENTENCE_TERMINATORS.lastIndex = 0;
  return matches.length + (endsWithTerminator ? 0 : 1);
}

function countParagraphs(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed
    .split(/\n\s*\n+/u)
    .map((block) => block.trim())
    .filter((block) => block.length > 0).length;
}

/**
 * Calcula métricas básicas de texto: palabras, caracteres, líneas, párrafos,
 * frases aproximadas y tiempo de lectura. Las frases son aproximadas porque
 * usan terminadores comunes; no detecta abreviaturas ni casos límite.
 */
export function analyzeTextStats(
  text: string,
  options: TextAnalysisOptions = {},
): TextAnalysis {
  const wordsPerMinute = options.wordsPerMinute ?? DEFAULT_WPM;
  const normalized = text.replace(/\r\n?/g, "\n");
  const words = countWords(normalized);
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s+/gu, "").length;
  const lines = normalized.length === 0 ? 0 : normalized.split("\n").length;
  const paragraphs = countParagraphs(normalized);
  const sentences = countSentences(normalized);
  const readingTimeSeconds =
    words === 0 || wordsPerMinute <= 0
      ? 0
      : Math.max(1, Math.round((words / wordsPerMinute) * 60));

  return {
    characters,
    charactersNoSpaces,
    words,
    lines,
    paragraphs,
    sentences,
    readingTimeSeconds,
    wordsPerMinute,
  };
}
