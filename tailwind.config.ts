import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          50: "#f3f7fa",
          100: "#e7eef4",
          200: "#d4e0e9",
          300: "#bdcedb",
        },
        ink: {
          900: "#13202b",
          700: "#2e4052",
          600: "#4c6074",
          500: "#637589",
          300: "#8a9aaa",
        },
        accent: {
          cyan: "#16aebd",
          teal: "#0f8f96",
          violet: "#7467c9",
          mint: "#62b892",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 60px rgba(30, 47, 64, 0.10)",
        panel: "0 10px 34px rgba(25, 43, 58, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
