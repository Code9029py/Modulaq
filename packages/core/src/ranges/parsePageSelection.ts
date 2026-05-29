import type { PageSelectionResult } from "./types";

function invalidPageMessage(pageNumber: number, totalPages: number) {
  return `La página ${pageNumber} no existe. Usá páginas entre 1 y ${totalPages}.`;
}

function isOutOfOrder(pages: number[]) {
  return pages.some((pageNumber, index) => index > 0 && pageNumber < pages[index - 1]);
}

/**
 * Parsea una selección de páginas tipo "1,3,5-7" y la valida contra el total.
 * Devuelve `pages` (1-based, deduplicadas, en orden de aparición) o `error`.
 */
export function parsePageSelection(input: string, totalPages: number): PageSelectionResult {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return { error: "Ingresá al menos una página o rango.", isOutOfOrder: false, pages: [] };
  }

  const pages: number[] = [];
  const includedPages = new Set<number>();
  const tokens = trimmedInput.split(",");

  for (const rawToken of tokens) {
    const token = rawToken.trim();

    if (!token) {
      return {
        error: "Formato inválido. Usá páginas como 1,3,5 o rangos como 2-4.",
        isOutOfOrder: false,
        pages: [],
      };
    }

    if (/^\d+$/.test(token)) {
      const pageNumber = Number(token);
      if (pageNumber < 1 || pageNumber > totalPages) {
        return { error: invalidPageMessage(pageNumber, totalPages), isOutOfOrder: false, pages: [] };
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
        error: "Formato inválido. Usá páginas como 1,3,5 o rangos como 2-4.",
        isOutOfOrder: false,
        pages: [],
      };
    }

    const startPage = Number(rangeMatch[1]);
    const endPage = Number(rangeMatch[2]);
    const rangeLabel = `${startPage}-${endPage}`;

    if (startPage < 1) {
      return { error: invalidPageMessage(startPage, totalPages), isOutOfOrder: false, pages: [] };
    }
    if (startPage > endPage) {
      return {
        error: `El rango ${rangeLabel} no es válido. La página inicial no puede ser mayor que la final.`,
        isOutOfOrder: false,
        pages: [],
      };
    }
    if (endPage > totalPages) {
      return {
        error: `El rango ${rangeLabel} no es válido. El PDF tiene solo ${totalPages} páginas.`,
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
