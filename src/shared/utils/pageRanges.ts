// `parsePageSelection` y `PageSelectionResult` viven en @modulaq/core/ranges.
// Acá se re-exportan para que los services no migrados y los Tool components
// que importan desde este archivo sigan funcionando sin cambios.
export { parsePageSelection } from "@modulaq/core/ranges";
export type { PageSelectionError, PageSelectionResult } from "@modulaq/core/ranges";
import type { PageSelectionError, PageSelectionResult } from "@modulaq/core/ranges";

export type PartsValidationResult = {
  assignedPageCount: number;
  error: PageSelectionError | null;
  isValid: boolean;
  missingPages: number[];
  pagesByPart: number[][];
  repeatedPages: number[];
};

function isOutOfOrder(pages: number[]) {
  return pages.some((pageNumber, index) => index > 0 && pageNumber < pages[index - 1]);
}

function invalidPageError(pageNumber: number, totalPages: number): PageSelectionError {
  return { code: "tools.errors.pageNotExists", vars: { page: pageNumber, total: totalPages } };
}

function parsePages(
  input: string,
  totalPages: number,
  options: { partNumber?: number; rejectDuplicates?: boolean } = {},
): PageSelectionResult {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return {
      error: { code: "tools.errors.pageRangeEmpty" },
      isOutOfOrder: false,
      pages: [],
    };
  }

  const pages: number[] = [];
  const includedPages = new Set<number>();
  const tokens = trimmedInput.split(",");

  for (const rawToken of tokens) {
    const token = rawToken.trim();

    if (!token) {
      return {
        error: { code: "tools.errors.pageRangeInvalidFormat" },
        isOutOfOrder: false,
        pages: [],
      };
    }

    if (/^\d+$/.test(token)) {
      const pageNumber = Number(token);

      if (pageNumber < 1 || pageNumber > totalPages) {
        return {
          error: invalidPageError(pageNumber, totalPages),
          isOutOfOrder: false,
          pages: [],
        };
      }

      if (includedPages.has(pageNumber)) {
        if (options.rejectDuplicates) {
          return {
            error: {
              code: "tools.errors.pageRepeatedInPart",
              vars: { page: pageNumber, part: options.partNumber ?? 0 },
            },
            isOutOfOrder: false,
            pages: [],
          };
        }

        continue;
      }

      includedPages.add(pageNumber);
      pages.push(pageNumber);
      continue;
    }

    const rangeMatch = token.match(/^(\d+)\s*-\s*(\d+)$/);

    if (!rangeMatch) {
      return {
        error: { code: "tools.errors.pageRangeInvalidFormat" },
        isOutOfOrder: false,
        pages: [],
      };
    }

    const startPage = Number(rangeMatch[1]);
    const endPage = Number(rangeMatch[2]);
    const rangeLabel = `${startPage}-${endPage}`;

    if (startPage < 1) {
      return {
        error: invalidPageError(startPage, totalPages),
        isOutOfOrder: false,
        pages: [],
      };
    }

    if (startPage > endPage) {
      return {
        error: { code: "tools.errors.rangeStartGreater", vars: { range: rangeLabel } },
        isOutOfOrder: false,
        pages: [],
      };
    }

    if (endPage > totalPages) {
      return {
        error: {
          code: "tools.errors.rangeEndExceeds",
          vars: { range: rangeLabel, total: totalPages },
        },
        isOutOfOrder: false,
        pages: [],
      };
    }

    for (let pageNumber = startPage; pageNumber <= endPage; pageNumber += 1) {
      if (includedPages.has(pageNumber)) {
        if (options.rejectDuplicates) {
          return {
            error: {
              code: "tools.errors.pageRepeatedInPart",
              vars: { page: pageNumber, part: options.partNumber ?? 0 },
            },
            isOutOfOrder: false,
            pages: [],
          };
        }

        continue;
      }

      includedPages.add(pageNumber);
      pages.push(pageNumber);
    }
  }

  return {
    error: null,
    isOutOfOrder: isOutOfOrder(pages),
    pages,
  };
}

export function validateParts(parts: string[], totalPages: number): PartsValidationResult {
  const pagesByPart: number[][] = [];
  const pageAssignments = new Map<number, number>();
  let firstSelectionError: PageSelectionError | null = null;
  let firstEmptyPart: number | null = null;

  parts.forEach((part, index) => {
    if (!part.trim()) {
      pagesByPart.push([]);
      firstEmptyPart ??= index + 1;
      return;
    }

    const selection = parsePages(part, totalPages, {
      partNumber: index + 1,
      rejectDuplicates: true,
    });
    pagesByPart.push(selection.pages);

    if (selection.error) {
      firstSelectionError ??= selection.error;
      return;
    }

    selection.pages.forEach((pageNumber) => {
      pageAssignments.set(pageNumber, (pageAssignments.get(pageNumber) ?? 0) + 1);
    });
  });

  const repeatedPages = Array.from(pageAssignments.entries())
    .filter(([, count]) => count > 1)
    .map(([pageNumber]) => pageNumber)
    .sort((firstPage, secondPage) => firstPage - secondPage);
  const missingPages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (pageNumber) => !pageAssignments.has(pageNumber),
  );

  let error: PageSelectionError | null = firstSelectionError;

  if (!error && firstEmptyPart !== null) {
    error = {
      code: "tools.errors.partEmpty",
      vars: { part: firstEmptyPart, newCount: parts.length - 1 },
    };
  }

  if (!error && repeatedPages.length > 0) {
    error = {
      code: "tools.errors.partsPageOverAssigned",
      vars: { page: repeatedPages[0] },
    };
  }

  if (!error && missingPages.length > 0) {
    error =
      missingPages.length === 1
        ? { code: "tools.errors.partsPageMissing", vars: { page: missingPages[0] } }
        : { code: "tools.errors.partsPagesMissing", vars: { pages: missingPages.join(", ") } };
  }

  return {
    assignedPageCount: pageAssignments.size,
    error,
    isValid: error === null,
    missingPages,
    pagesByPart,
    repeatedPages,
  };
}
