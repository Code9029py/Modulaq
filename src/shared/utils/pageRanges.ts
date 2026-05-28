export type PageSelectionResult = {
  error: string | null;
  isOutOfOrder: boolean;
  pages: number[];
};

export type PartsValidationResult = {
  assignedPageCount: number;
  error: string | null;
  isValid: boolean;
  missingPages: number[];
  pagesByPart: number[][];
  repeatedPages: number[];
};

function invalidPageMessage(pageNumber: number, totalPages: number) {
  return `La página ${pageNumber} no existe. Usá páginas entre 1 y ${totalPages}.`;
}

function isOutOfOrder(pages: number[]) {
  return pages.some((pageNumber, index) => index > 0 && pageNumber < pages[index - 1]);
}

function parsePages(
  input: string,
  totalPages: number,
  options: { partNumber?: number; rejectDuplicates?: boolean } = {},
): PageSelectionResult {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return {
      error: "Ingresá al menos una página o rango.",
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
        error: "Formato inválido. Usá páginas como 1,3,5 o rangos como 2-4.",
        isOutOfOrder: false,
        pages: [],
      };
    }

    if (/^\d+$/.test(token)) {
      const pageNumber = Number(token);

      if (pageNumber < 1 || pageNumber > totalPages) {
        return {
          error: invalidPageMessage(pageNumber, totalPages),
          isOutOfOrder: false,
          pages: [],
        };
      }

      if (includedPages.has(pageNumber)) {
        if (options.rejectDuplicates) {
          return {
            error: `La página ${pageNumber} está repetida dentro de la parte ${options.partNumber}.`,
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
        error: "Formato inválido. Usá páginas como 1,3,5 o rangos como 2-4.",
        isOutOfOrder: false,
        pages: [],
      };
    }

    const startPage = Number(rangeMatch[1]);
    const endPage = Number(rangeMatch[2]);
    const rangeLabel = `${startPage}-${endPage}`;

    if (startPage < 1) {
      return {
        error: invalidPageMessage(startPage, totalPages),
        isOutOfOrder: false,
        pages: [],
      };
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
        if (options.rejectDuplicates) {
          return {
            error: `La página ${pageNumber} está repetida dentro de la parte ${options.partNumber}.`,
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

export function parsePageSelection(input: string, totalPages: number): PageSelectionResult {
  return parsePages(input, totalPages);
}

export function validateParts(parts: string[], totalPages: number): PartsValidationResult {
  const pagesByPart: number[][] = [];
  const pageAssignments = new Map<number, number>();
  let firstSelectionError: string | null = null;
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

  let error: string | null = firstSelectionError;

  if (!error && firstEmptyPart !== null) {
    error = `La parte ${firstEmptyPart} está vacía. Si querés dividir el PDF en ${parts.length - 1} archivos, cambiá la cantidad de partes a ${parts.length - 1}.`;
  }

  if (!error && repeatedPages.length > 0) {
    error = `La página ${repeatedPages[0]} está asignada en más de una parte.`;
  }

  if (!error && missingPages.length > 0) {
    error =
      missingPages.length === 1
        ? `Falta asignar la página ${missingPages[0]}.`
        : `Falta asignar: páginas ${missingPages.join(", ")}.`;
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
