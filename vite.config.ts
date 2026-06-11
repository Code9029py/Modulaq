import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import type { ViteReactSSGOptions } from "vite-react-ssg";

const ssgOptions: ViteReactSSGOptions = {
  crittersOptions: false,
};

export default defineConfig({
  plugins: [react()],
  ssgOptions,
  build: {
    rollupOptions: {
      output: {
        // Keep pdfjs in a dedicated lazy chunk so the eager app bundle does
        // not pull it into home/catalog routes. Let pdf-lib and jszip split
        // naturally; forcing them captured shared helpers and created preloads.
        manualChunks: (id) => {
          if (id.includes("node_modules/pdfjs-dist")) return "pdfjs";
          return undefined;
        },
      },
    },
  },
});
