import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import type { ViteReactSSGOptions } from "vite-react-ssg";

const ssgOptions: ViteReactSSGOptions = {
  crittersOptions: false,
};

export default defineConfig({
  plugins: [react()],
  ssgOptions,
});
