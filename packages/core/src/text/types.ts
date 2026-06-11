export type TextCleanOptions = {
  removeMultipleSpaces: boolean;
  removeExtraLineBreaks: boolean;
  trimEdges: boolean;
  normalizeQuotes: boolean;
  removeInvisibleCharacters: boolean;
  collapseEmptyLines: boolean;
};

export type TextStats = {
  characters: number;
  words: number;
  lines: number;
};

export type TextAnalysisOptions = {
  wordsPerMinute?: number;
};

export type TextAnalysis = {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  sentences: number;
  readingTimeSeconds: number;
  wordsPerMinute: number;
};

export type MarkdownToHtmlOptions = {
  document?: boolean;
  title?: string;
};

export type MarkdownToHtmlResult = {
  html: string;
  isDocument: boolean;
};

export type CompareMode = "lines" | "words";

export type CompareTextsOptions = {
  mode: CompareMode;
  ignoreCase?: boolean;
  ignoreWhitespace?: boolean;
};

export type DiffEntryType = "added" | "removed" | "unchanged";

export type DiffEntry = {
  type: DiffEntryType;
  value: string;
};

export type CompareTextsSummary = {
  added: number;
  removed: number;
  unchanged: number;
  totalDifferences: number;
};

export type CompareTextsResult = {
  mode: CompareMode;
  entries: DiffEntry[];
  summary: CompareTextsSummary;
};
