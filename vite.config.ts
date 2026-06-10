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
        // Aísla librerías pesadas en chunks propios para que el chunk "shared"
        // (eager en cada página) no las arrastre. Cada herramienta lazy que
        // las use traerá el chunk on-demand.
        // - pdfjs-dist: ~300 KB. Sólo lo necesitan pdf-to-images y extract-pdf-text.
        // - pdf-lib: ~430 KB. Sólo lo necesitan las herramientas de PDF.
        // - jszip: ya está dividido naturalmente; lo dejamos por claridad.
        manualChunks: (id) => {
          if (id.includes("node_modules/pdfjs-dist")) return "pdfjs";
          if (id.includes("node_modules/pdf-lib")) return "pdf-lib";
          if (id.includes("node_modules/jszip")) return "jszip";
          return undefined;
        },
      },
    },
  },
});
