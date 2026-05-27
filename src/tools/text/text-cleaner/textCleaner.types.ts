export type TextCleanerOptions = {
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

export type TextCleanerResult = {
  output: string;
  before: TextStats;
  after: TextStats;
};
