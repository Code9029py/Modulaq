export type PageSelectionErrorVars = Record<string, string | number>;

export type PageSelectionError = {
  code: string;
  vars?: PageSelectionErrorVars;
};

export type PageSelectionResult = {
  error: PageSelectionError | null;
  isOutOfOrder: boolean;
  pages: number[];
};
