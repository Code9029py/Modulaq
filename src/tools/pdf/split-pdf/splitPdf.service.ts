import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import type { PageSelectionResult, PartsValidationResult, SplitPdfMetadata, SplitPdfResult } from "./splitPdf.types";

export const defaultOutputBaseName = "archivo-dividido";

export function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  return `${(kilobytes / 1024).toFixed(2)} MB`;
}

export function getBaseFileName(fileName: string) {
  const nameWithoutPath = fileName.split(/[/\\]/).pop() ?? fileName;
  const extensionIndex = nameWithoutPath.lastIndexOf(".");

  return extensionIndex > 0 ? nameWithoutPath.slice(0, extensionIndex) : nameWithoutPath;
}

function cleanOutputBaseName(fileName: string) {
  const withoutKnownExtension = fileName.trim().replace(/\.(pdf|zip)$/i, "");
  return withoutKnownExtension
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "")
    .trim();
}

export function getOutputBaseNameError(fileName: string) {
  if (!fileName.trim()) {
    return null;
  }

  return cleanOutputBaseName(fileName)
    ? null
    : "El nombre de salida no contiene caracteres válidos.";
}

export function sanitizeOutputBaseName(fileName: string, fallbackBaseName = defaultOutputBaseName) {
  const sanitizedName = cleanOutputBaseName(fileName);
  const safeName = sanitizedName.length > 0 ? sanitizedName : fallbackBaseName;

  return /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(safeName) ? `${safeName}-archivo` : safeName;
}

export function getSuggestedOutputBaseName(fileName: string) {
  return sanitizeOutputBaseName(`${getBaseFileName(fileName)}-dividido`);
}

export function buildOutputFileName(baseName: string, extension: "pdf" | "zip", fallbackBaseName = defaultOutputBaseName) {
  const nameError = getOutputBaseNameError(baseName);

  if (nameError) {
    throw new Error(nameError);
  }

  return `${sanitizeOutputBaseName(baseName, fallbackBaseName)}.${extension}`;
}

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

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function loadPdfDocument(file: File) {
  if (!isPdfFile(file)) {
    throw new Error("Seleccioná un archivo PDF válido.");
  }

  try {
    return await PDFDocument.load(await file.arrayBuffer(), {
      ignoreEncryption: true,
    });
  } catch {
    throw new Error("No se pudo leer el PDF. Puede estar dañado, protegido o incompleto.");
  }
}

async function createPdfFromPages(sourceDocument: PDFDocument, pageNumbers: number[]) {
  const resultDocument = await PDFDocument.create();
  const pages = await resultDocument.copyPages(
    sourceDocument,
    pageNumbers.map((pageNumber) => pageNumber - 1),
  );

  pages.forEach((page) => resultDocument.addPage(page));

  return resultDocument.save();
}

export async function readPdfMetadata(file: File): Promise<SplitPdfMetadata> {
  const pdfDocument = await loadPdfDocument(file);

  return {
    fileName: file.name,
    fileSize: file.size,
    pageCount: pdfDocument.getPageCount(),
  };
}

export async function extractSelectedPages(
  file: File,
  pageSelection: string,
  outputBaseName: string,
): Promise<SplitPdfResult> {
  const sourceDocument = await loadPdfDocument(file);
  const selection = parsePageSelection(pageSelection, sourceDocument.getPageCount());
  const fallbackBaseName = getSuggestedOutputBaseName(file.name);

  if (selection.error) {
    throw new Error(selection.error);
  }

  return {
    bytes: toArrayBuffer(await createPdfFromPages(sourceDocument, selection.pages)),
    fileName: buildOutputFileName(outputBaseName, "pdf", fallbackBaseName),
    mimeType: "application/pdf",
    outputCount: 1,
    pageCount: selection.pages.length,
  };
}

export async function createZipFromParts(
  file: File,
  parts: string[],
  outputBaseName: string,
): Promise<SplitPdfResult> {
  const sourceDocument = await loadPdfDocument(file);
  const validation = validateParts(parts, sourceDocument.getPageCount());
  const fallbackBaseName = getSuggestedOutputBaseName(file.name);

  if (!validation.isValid) {
    throw new Error(validation.error ?? "Revisá la asignación de páginas.");
  }

  const safeBaseName = sanitizeOutputBaseName(outputBaseName, fallbackBaseName);
  const zip = new JSZip();

  for (let index = 0; index < validation.pagesByPart.length; index += 1) {
    zip.file(`${safeBaseName}-parte-${index + 1}.pdf`, await createPdfFromPages(sourceDocument, validation.pagesByPart[index]));
  }

  return {
    bytes: await zip.generateAsync({ type: "arraybuffer" }),
    fileName: buildOutputFileName(outputBaseName, "zip", fallbackBaseName),
    mimeType: "application/zip",
    outputCount: parts.length,
    pageCount: sourceDocument.getPageCount(),
  };
}

export async function splitPdfIntoIndividualPages(file: File, outputBaseName: string): Promise<SplitPdfResult> {
  const sourceDocument = await loadPdfDocument(file);
  const pageCount = sourceDocument.getPageCount();
  const fallbackBaseName = getSuggestedOutputBaseName(file.name);

  if (pageCount === 1) {
    return {
      bytes: toArrayBuffer(await createPdfFromPages(sourceDocument, [1])),
      fileName: buildOutputFileName(outputBaseName, "pdf", fallbackBaseName),
      mimeType: "application/pdf",
      outputCount: 1,
      pageCount,
    };
  }

  const safeBaseName = sanitizeOutputBaseName(outputBaseName, fallbackBaseName);
  const zip = new JSZip();

  for (let index = 0; index < pageCount; index += 1) {
    zip.file(`${safeBaseName}-pagina-${index + 1}.pdf`, await createPdfFromPages(sourceDocument, [index + 1]));
  }

  return {
    bytes: await zip.generateAsync({ type: "arraybuffer" }),
    fileName: buildOutputFileName(outputBaseName, "zip", fallbackBaseName),
    mimeType: "application/zip",
    outputCount: pageCount,
    pageCount,
  };
}
