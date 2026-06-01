// Helper para cargar fixtures binarias desde los tests del SDK.
// Vive fuera de `src/` a propósito: así no entra a `tsc -b` y no contamina `dist/`.
// Vitest lo importa vía esbuild sin restricciones de rootDir.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const fixturesRoot = dirname(fileURLToPath(import.meta.url));

export function loadPdfFixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync(join(fixturesRoot, "pdf", name)));
}

export function loadImageFixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync(join(fixturesRoot, "images", name)));
}

/** Bytes claramente NO-PDF, para casos de error de parseo. */
export function garbageBytes(size = 16): Uint8Array {
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i += 1) {
    bytes[i] = (i * 13 + 7) % 256;
  }
  return bytes;
}
