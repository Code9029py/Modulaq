// Convenience root export. Para mejor tree-shaking, preferí los subpath:
//   import { cleanText } from "@modulaq/core/text";
//   import { countPdfPages } from "@modulaq/core/pdf";
export * from "./text/index";
export * from "./pdf/index";
export * from "./qr/index";
export * from "./files/index";
export * from "./ranges/index";
