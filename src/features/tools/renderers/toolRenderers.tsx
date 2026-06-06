import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { ToolMetadata } from "../types/tool.types";

export type ToolRendererProps = {
  tool: ToolMetadata;
};

export type ToolRenderer = LazyExoticComponent<ComponentType<ToolRendererProps>>;

const toolRenderers: Partial<Record<ToolMetadata["id"], ToolRenderer>> = {
  "image-base64": lazy(() =>
    import("../../../tools/image/image-base64").then((module) => ({ default: module.ImageBase64Tool })),
  ),
  "image-compressor": lazy(() =>
    import("../../../tools/image/image-compressor").then((module) => ({ default: module.ImageCompressorTool })),
  ),
  "image-converter": lazy(() =>
    import("../../../tools/image/image-converter").then((module) => ({ default: module.ImageConverterTool })),
  ),
  "image-rotator": lazy(() =>
    import("../../../tools/image/image-rotator").then((module) => ({ default: module.ImageRotatorTool })),
  ),
  "image-resizer": lazy(() =>
    import("../../../tools/image/image-resizer").then((module) => ({ default: module.ImageResizerTool })),
  ),
  "image-to-pdf": lazy(() =>
    import("../../../tools/pdf/image-to-pdf").then((module) => ({ default: module.ImageToPdfTool })),
  ),
  "merge-pdf": lazy(() =>
    import("../../../tools/pdf/merge-pdf").then((module) => ({ default: module.MergePdfTool })),
  ),
  "compress-pdf": lazy(() =>
    import("../../../tools/pdf/compress-pdf").then((module) => ({ default: module.CompressPdfTool })),
  ),
  "extract-pdf-text": lazy(() =>
    import("../../../tools/pdf/extract-pdf-text").then((module) => ({ default: module.ExtractPdfTextTool })),
  ),
  "pdf-page-counter": lazy(() =>
    import("../../../tools/pdf/pdf-page-counter").then((module) => ({ default: module.PdfPageCounterTool })),
  ),
  "pdf-to-images": lazy(() =>
    import("../../../tools/pdf/pdf-to-images").then((module) => ({ default: module.PdfToImagesTool })),
  ),
  "reorder-pdf-pages": lazy(() =>
    import("../../../tools/pdf/reorder-pdf-pages").then((module) => ({ default: module.ReorderPdfPagesTool })),
  ),
  "split-pdf": lazy(() =>
    import("../../../tools/pdf/split-pdf").then((module) => ({ default: module.SplitPdfTool })),
  ),
  "qr-generator": lazy(() =>
    import("../../../tools/productivity/qr-generator").then((module) => ({ default: module.QrGeneratorTool })),
  ),
  "text-cleaner": lazy(() =>
    import("../../../tools/text/text-cleaner").then((module) => ({ default: module.TextCleanerTool })),
  ),
};

export function getToolRenderer(toolId: ToolMetadata["id"]) {
  return toolRenderers[toolId];
}
