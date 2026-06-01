import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const here = dirname(fileURLToPath(import.meta.url));
const sdkSubpath = (name: string) => resolve(here, "packages/core/src", name, "index.ts");

export default defineConfig({
  // Redirigimos @modulaq/core/* a los archivos SOURCE del workspace para que
  // los tests no dependan de `dist/`. El package.json del SDK declara `exports`
  // apuntando a `dist/`, lo cual es correcto en producción/consumo real, pero
  // obligaría a buildear el SDK antes de cada `vitest run`. Con estos alias,
  // Vitest siempre lee TypeScript fuente vía esbuild (también más rápido).
  resolve: {
    alias: {
      "@modulaq/core/text": sdkSubpath("text"),
      "@modulaq/core/qr": sdkSubpath("qr"),
      "@modulaq/core/pdf": sdkSubpath("pdf"),
      "@modulaq/core/pdf-render": sdkSubpath("pdf-render"),
      "@modulaq/core/files": sdkSubpath("files"),
      "@modulaq/core/ranges": sdkSubpath("ranges"),
      "@modulaq/core": resolve(here, "packages/core/src/index.ts"),
    },
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
    // Imports explícitos en cada test (`import { describe, it, expect } from "vitest"`).
    globals: false,
    // Reporter resumido para CI-friendliness; `default` muestra detalles en local.
    reporters: process.env.CI ? "dot" : "default",
  },
});
