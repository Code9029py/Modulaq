import * as pdfjsLib from "pdfjs-dist";

/**
 * Configura el worker que usará pdfjs-dist internamente.
 *
 * Llamar UNA VEZ por aplicación antes de usar `extractPdfText` u otras
 * funciones del subpath /pdf-render. La función es idempotente: si se
 * llama varias veces, la última configuración gana.
 *
 * IMPORTANTE: el archivo `pdf.worker.min.mjs` apuntado debe ser exactamente
 * de la MISMA versión de `pdfjs-dist` que tenés instalada. Versiones distintas
 * pueden producir errores oscuros en runtime.
 *
 * Patrones típicos:
 *
 *  ```ts
 *  // Vite (?url)
 *  import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
 *  configurePdfWorker(workerUrl);
 *
 *  // Bundler genérico (ESM Worker)
 *  configurePdfWorker({
 *    workerPort: new Worker(
 *      new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url),
 *      { type: "module" },
 *    ),
 *  });
 *
 *  // CDN (anclando la versión instalada)
 *  configurePdfWorker(
 *    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/<VERSION>/pdf.worker.min.mjs",
 *  );
 *  ```
 */
export function configurePdfWorker(workerSrc: string | URL): void;
export function configurePdfWorker(options: { workerPort: Worker }): void;
export function configurePdfWorker(arg: string | URL | { workerPort: Worker }): void {
  if (typeof arg === "string") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = arg;
    return;
  }
  if (arg instanceof URL) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = arg.toString();
    return;
  }
  pdfjsLib.GlobalWorkerOptions.workerPort = arg.workerPort;
}
