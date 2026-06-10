import type { PageSelectionError, PageSelectionResult } from "./types";

function invalidPageError(pageNumber: number, totalPages: number): PageSelectionError {
  return { code: "tools.errors.pageNotExists", vars: { page: pageNumber, total: totalPages } };
}

function isOutOfOrder(pages: number[]) {
  return pages.some((pageNumber, index) => index > 0 && pageNumber < pages[index - 1]);
}

/**
 * Parsea una selección de páginas tipo "1,3,5-7" y la valida contra el total.
 * Devuelve `pages` (1-based, deduplicadas, en orden de aparición) o `error`
 * como `{ code, vars }` — el consumidor traduce el `code` con su `t()`.
 */
export function parsePageSelection(input: string, totalPages: number): PageSelectionResult {
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
        return { error: invalidPageError(pageNumber, totalPages), isOutOfOrder: false, pages: [] };
      }
      if (includedPages.has(pageNumber)) {
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
      return { error: invalidPageError(startPage, totalPages), isOutOfOrder: false, pages: [] };
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
        continue;
      }
      includedPages.add(pageNumber);
      pages.push(pageNumber);
    }
  }

  return { error: null, isOutOfOrder: isOutOfOrder(pages), pages };
}
