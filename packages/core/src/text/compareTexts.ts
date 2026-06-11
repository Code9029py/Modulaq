import type {
  CompareTextsOptions,
  CompareTextsResult,
  CompareTextsSummary,
  DiffEntry,
} from "./types";

function normalizeUnit(value: string, options: CompareTextsOptions): string {
  let next = value;
  if (options.ignoreCase) next = next.toLowerCase();
  if (options.ignoreWhitespace) next = next.replace(/\s+/gu, " ").trim();
  return next;
}

function splitInput(text: string, mode: CompareTextsOptions["mode"]): string[] {
  if (text.length === 0) return [];
  if (mode === "lines") {
    return text.replace(/\r\n?/g, "\n").split("\n");
  }
  // "words": divide por whitespace pero conserva los espacios como separadores
  // visibles. Devolvemos solo tokens no vacíos.
  return text.split(/\s+/u).filter((token) => token.length > 0);
}

/**
 * Diff entre dos secuencias de tokens usando programación dinámica (LCS).
 * Complejidad O(n * m) en memoria — apropiada para textos de tamaño medio.
 */
function diffTokens(
  left: readonly string[],
  right: readonly string[],
  options: CompareTextsOptions,
): DiffEntry[] {
  const m = left.length;
  const n = right.length;
  const leftNorm = left.map((token) => normalizeUnit(token, options));
  const rightNorm = right.map((token) => normalizeUnit(token, options));

  // dp[i][j] = longitud del LCS entre left[0..i] y right[0..j]
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      dp[i][j] =
        leftNorm[i - 1] === rightNorm[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const entries: DiffEntry[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (leftNorm[i - 1] === rightNorm[j - 1]) {
      entries.push({ type: "unchanged", value: right[j - 1] });
      i -= 1;
      j -= 1;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      entries.push({ type: "removed", value: left[i - 1] });
      i -= 1;
    } else {
      entries.push({ type: "added", value: right[j - 1] });
      j -= 1;
    }
  }
  while (i > 0) {
    entries.push({ type: "removed", value: left[i - 1] });
    i -= 1;
  }
  while (j > 0) {
    entries.push({ type: "added", value: right[j - 1] });
    j -= 1;
  }

  entries.reverse();
  return entries;
}

function summarize(entries: readonly DiffEntry[]): CompareTextsSummary {
  let added = 0;
  let removed = 0;
  let unchanged = 0;
  for (const entry of entries) {
    if (entry.type === "added") added += 1;
    else if (entry.type === "removed") removed += 1;
    else unchanged += 1;
  }
  return {
    added,
    removed,
    unchanged,
    totalDifferences: added + removed,
  };
}

/**
 * Compara dos textos por líneas o por palabras y devuelve una lista de tokens
 * etiquetados como agregados, eliminados o sin cambios. Las opciones permiten
 * ignorar mayúsculas/minúsculas y normalizar whitespace antes de comparar; los
 * valores devueltos son siempre los originales del texto B (o A si se eliminó).
 */
export function compareTexts(
  leftText: string,
  rightText: string,
  options: CompareTextsOptions = { mode: "lines" },
): CompareTextsResult {
  const mode = options.mode ?? "lines";
  const normalizedOptions: CompareTextsOptions = {
    mode,
    ignoreCase: Boolean(options.ignoreCase),
    ignoreWhitespace: Boolean(options.ignoreWhitespace),
  };

  const leftTokens = splitInput(leftText, mode);
  const rightTokens = splitInput(rightText, mode);

  // Atajos: cuando alguno está vacío, evitamos el costo del DP.
  let entries: DiffEntry[];
  if (leftTokens.length === 0 && rightTokens.length === 0) {
    entries = [];
  } else if (leftTokens.length === 0) {
    entries = rightTokens.map((value) => ({ type: "added", value }));
  } else if (rightTokens.length === 0) {
    entries = leftTokens.map((value) => ({ type: "removed", value }));
  } else {
    entries = diffTokens(leftTokens, rightTokens, normalizedOptions);
  }

  return {
    mode,
    entries,
    summary: summarize(entries),
  };
}
