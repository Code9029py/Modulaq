import { defineConfig } from "vitest/config";

export default defineConfig({
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
