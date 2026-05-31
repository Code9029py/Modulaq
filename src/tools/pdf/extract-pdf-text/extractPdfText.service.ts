import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy, TextItem } from "pdfjs-dist/types/src/display/api";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  configurePdfWorker,
  extractPdfText as coreExtractPdfText,
} from "@modulaq/core/pdf-render";
import { buildDownloadFileName, getSuggestedDownloadBaseName } from "../../../shared/utils/downloadFileName";
import { formatFileSize, isPdfFile } from "../../../shared/utils/file";
import type {
  ExtractedPdfPage,
  ExtractPdfTextMetadata,
  ExtractPdfTextOptions,
  ExtractPdfTextProgress,
  ExtractPdfTextResult,
} from "./extractPdfText.types";

// Configurar el worker de pdfjs-dist una sola vez al cargar el módulo.
// El adapter sigue usando pdfjsLib directamente para la rama de "layout
// aproximado" (no migrada al SDK en V3.1), así que ambos consumidores
// comparten esta misma configuración del singleton GlobalWorkerOptions.
configurePdfWorker(pdfWorkerUrl);

const readPdfErrorMessage = "No se pudo leer el PDF. Verificá que el archivo no esté dañado o protegido.";
const minimumSelectableCharacters = 3;
const suspiciousSymbolPattern = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\uE000-\uF8FF\uFFFD]|\p{Co}/gu;
export const defaultOutputBaseName = "texto-extraido";

type PositionedTextItem = {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type TextLine = {
  y: number;
  height: number;
  items: PositionedTextItem[];
};

export { formatFileSize, isPdfFile };

export function getSuggestedOutputBaseName(pdfFileName: string) {
  return getSuggestedDownloadBaseName(pdfFileName, defaultOutputBaseName);
}

export function getTextFileName(outputBaseName: string, fallbackBaseName = defaultOutputBaseName) {
  return buildDownloadFileName(outputBaseName, "txt", fallbackBaseName);
}

async function loadPdfDocument(file: File): Promise<PDFDocumentProxy> {
  if (!isPdfFile(file)) {
    throw new Error("Seleccioná un archivo PDF válido.");
  }

  try {
    const data = new Uint8Array(await file.arrayBuffer());
    return await pdfjsLib.getDocument({ data }).promise;
  } catch {
    throw new Error(readPdfErrorMessage);
  }
}

export async function readPdfMetadata(file: File): Promise<ExtractPdfTextMetadata> {
  const pdf = await loadPdfDocument(file);

  try {
    return {
      fileName: file.name,
      fileSize: file.size,
      pageCount: pdf.numPages,
    };
  } finally {
    await pdf.destroy();
  }
}

function isTextItem(item: unknown): item is TextItem {
  return Boolean(
    item &&
      typeof item === "object" &&
      "str" in item &&
      typeof item.str === "string" &&
      "transform" in item &&
      Array.isArray(item.transform),
  );
}

function getTextItems(items: unknown[]) {
  return items.filter(isTextItem).filter((item) => item.str.trim().length > 0);
}

function normalizeExtractedText(text: string) {
  return text
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getContinuousPageText(items: TextItem[]) {
  return normalizeExtractedText(items.map((item) => item.str).join(" "));
}

function getMedianHeight(items: PositionedTextItem[]) {
  const heights = items.map((item) => item.height).filter((height) => height > 0).sort((left, right) => left - right);

  if (heights.length === 0) {
    return 10;
  }

  return heights[Math.floor(heights.length / 2)];
}

function joinLineItems(items: PositionedTextItem[]) {
  const sortedItems = [...items].sort((left, right) => left.x - right.x);
  let lineText = "";
  let previous: PositionedTextItem | null = null;

  for (const item of sortedItems) {
    const itemText = item.str.replace(/\s+/g, " ").trim();

    if (previous) {
      const horizontalGap = item.x - (previous.x + previous.width);
      const spacingThreshold = Math.max(1.25, Math.min(previous.height, item.height) * 0.16);
      const beginsWithPunctuation = /^[,.;:!?%)}\]]/.test(itemText);
      const hasExplicitSpace = /\s$/.test(previous.str) || /^\s/.test(item.str);

      if ((hasExplicitSpace || horizontalGap > spacingThreshold) && !beginsWithPunctuation && !lineText.endsWith(" ")) {
        lineText += " ";
      }
    }

    lineText += itemText;
    previous = item;
  }

  return lineText.trim();
}

function getLayoutPageText(items: TextItem[]) {
  const positionedItems = items
    .map((item) => ({
      str: item.str,
      x: item.transform[4],
      y: item.transform[5],
      width: item.width || 0,
      height: item.height || Math.abs(item.transform[3]) || 10,
    }))
    .sort((left, right) => right.y - left.y || left.x - right.x);
  const lineTolerance = Math.max(2, Math.min(6, getMedianHeight(positionedItems) * 0.42));
  const lines: TextLine[] = [];

  for (const item of positionedItems) {
    let targetLine: TextLine | undefined;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const line of lines) {
      const distance = Math.abs(line.y - item.y);
      const tolerance = Math.max(lineTolerance, Math.min(line.height, item.height) * 0.35);

      if (distance <= tolerance && distance < closestDistance) {
        targetLine = line;
        closestDistance = distance;
      }
    }

    if (targetLine) {
      targetLine.y = (targetLine.y * targetLine.items.length + item.y) / (targetLine.items.length + 1);
      targetLine.height = Math.max(targetLine.height, item.height);
      targetLine.items.push(item);
    } else {
      lines.push({ y: item.y, height: item.height, items: [item] });
    }
  }

  return normalizeExtractedText(
    lines
      .sort((left, right) => right.y - left.y)
      .map((line) => joinLineItems(line.items))
      .filter(Boolean)
      .join("\n"),
  );
}

function formatPageText(pages: ExtractedPdfPage[]) {
  if (pages.every((page) => page.text.length === 0)) {
    return "";
  }

  return pages.map((page) => `--- Página ${page.pageNumber} ---\n${page.text}`.trimEnd()).join("\n\n");
}

function countProblematicSymbols(text: string) {
  return Array.from(text.matchAll(suspiciousSymbolPattern)).length;
}

function buildExtractResult(
  pages: ExtractedPdfPage[],
  pageCount: number,
  file: File,
): ExtractPdfTextResult {
  const text = formatPageText(pages);
  const pagesWithText = pages.filter((page) => page.text.length > 0).length;
  const selectableText = pages.map((page) => page.text).join("").replace(/\s/g, "");
  const problematicSymbolCount = countProblematicSymbols(selectableText);
  const hasSelectableText = selectableText.length >= minimumSelectableCharacters;
  const suspiciousSymbolRatio = selectableText.length === 0 ? 0 : problematicSymbolCount / selectableText.length;

  return {
    text,
    fileName: getTextFileName(getSuggestedOutputBaseName(file.name)),
    pageCount,
    pagesWithText,
    hasSelectableText,
    likelyScanned: !hasSelectableText,
    hasProblematicSymbols:
      problematicSymbolCount >= 3 || (problematicSymbolCount > 0 && suspiciousSymbolRatio >= 0.02),
    problematicSymbolCount,
  };
}

async function extractWithLayout(
  file: File,
  onProgress?: (progress: ExtractPdfTextProgress) => void,
): Promise<ExtractPdfTextResult> {
  const pdf = await loadPdfDocument(file);
  const pages: ExtractedPdfPage[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      onProgress?.({ current: pageNumber, total: pdf.numPages });
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const textItems = getTextItems(content.items);
      pages.push({ pageNumber, text: getLayoutPageText(textItems) });
    }
    return buildExtractResult(pages, pdf.numPages, file);
  } catch {
    throw new Error("No se pudo extraer el texto del PDF.");
  } finally {
    await pdf.destroy();
  }
}

async function extractSimple(
  file: File,
  onProgress?: (progress: ExtractPdfTextProgress) => void,
): Promise<ExtractPdfTextResult> {
  try {
    onProgress?.({ current: 0, total: 1 });
    const { pages: rawPages } = await coreExtractPdfText(file);
    const pages: ExtractedPdfPage[] = rawPages.map((pageText, index) => ({
      pageNumber: index + 1,
      text: pageText,
    }));
    onProgress?.({ current: pages.length, total: pages.length });
    return buildExtractResult(pages, pages.length, file);
  } catch {
    throw new Error("No se pudo extraer el texto del PDF.");
  }
}

export async function extractPdfText(
  file: File,
  options: ExtractPdfTextOptions,
  onProgress?: (progress: ExtractPdfTextProgress) => void,
): Promise<ExtractPdfTextResult> {
  if (options.preserveApproximateLineBreaks) {
    return extractWithLayout(file, onProgress);
  }
  return extractSimple(file, onProgress);
}
