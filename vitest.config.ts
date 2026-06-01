import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const here = dirname(fileURLToPath(import.meta.url));
const src = (sub: string) => resolve(here, "packages/core/src", sub, "index.ts");

export default defineConfig({
  resolve: {
    // Forma array + RegExp con anclas exactas (^...$): cada alias matchea solo el
    // specifier exacto, evitando colisiones por prefix-match (p. ej. que
    // "@modulaq/core/pdf" capture "@modulaq/core/pdf-render").
    alias: [
      { find: /^@modulaq\/core\/text$/, replacement: src("text") },
      { find: /^@modulaq\/core\/qr$/, replacement: src("qr") },
      { find: /^@modulaq\/core\/pdf-render$/, replacement: src("pdf-render") },
      { find: /^@modulaq\/core\/pdf$/, replacement: src("pdf") },
      { find: /^@modulaq\/core\/files$/, replacement: src("files") },
      { find: /^@modulaq\/core\/ranges$/, replacement: src("ranges") },
      { find: /^@modulaq\/core$/, replacement: resolve(here, "packages/core/src/index.ts") },
    ],
  },
  test: {
    environment: "node",
    include: [
      "packages/core/src/**/*.test.ts",
      "src/**/*.test.ts",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.vite-react-ssg-temp/**",
    ],
    // Force Vitest to procesar @modulaq/core* vía el resolver de Vite (donde
    // los alias actúan), en lugar de delegar al resolver de Node que respeta
    // `package.json#exports` y apunta a `dist/` inexistente en CI limpio.
    server: {
      deps: {
        inline: [/^@modulaq\/core(\/.*)?$/],
      },
    },
    // Imports explícitos en cada test (`import { describe, it, expect } from "vitest"`).
    globals: false,
    // Reporter resumido para CI-friendliness; `default` muestra detalles en local.
    reporters: process.env.CI ? "dot" : "default",
  },
});
