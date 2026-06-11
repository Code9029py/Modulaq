import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { ToolMetadata } from "../types/tool.types";

export type ToolRendererProps = {
  tool: ToolMetadata;
};

export type ToolRenderer = LazyExoticComponent<ComponentType<ToolRendererProps>>;

const toolRenderers: Partial<Record<ToolMetadata["id"], ToolRenderer>> = {
  "base64-to-image": lazy(() =>
    import("../../../tools/image/image-base64").then((module) => ({ default: module.Base64ToImageTool })),
  ),
  "image-to-base64": lazy(() =>
    import("../../../tools/image/image-base64").then((module) => ({ default: module.ImageToBase64Tool })),
  ),
  "image-compressor": lazy(() =>
    import("../../../tools/image/image-compressor").then((module) => ({ default: module.ImageCompressorTool })),
  ),
  "image-color-extractor": lazy(() =>
    import("../../../tools/image/image-color-extractor").then((module) => ({
      default: module.ImageColorExtractorTool,
    })),
  ),
  "image-converter": lazy(() =>
    import("../../../tools/image/image-converter").then((module) => ({ default: module.ImageConverterTool })),
  ),
  "image-cropper": lazy(() =>
    import("../../../tools/image/image-cropper").then((module) => ({ default: module.ImageCropperTool })),
  ),
  "image-to-favicon": lazy(() =>
    import("../../../tools/image/image-to-favicon").then((module) => ({ default: module.ImageToFaviconTool })),
  ),
  "image-joiner": lazy(() =>
    import("../../../tools/image/image-joiner").then((module) => ({ default: module.ImageJoinerTool })),
  ),
  "image-placeholder": lazy(() =>
    import("../../../tools/image/image-placeholder").then((module) => ({ default: module.ImagePlaceholderTool })),
  ),
  "image-splitter": lazy(() =>
    import("../../../tools/image/image-splitter").then((module) => ({ default: module.ImageSplitterTool })),
  ),
  "svg-to-png": lazy(() =>
    import("../../../tools/image/svg-to-png").then((module) => ({ default: module.SvgToPngTool })),
  ),
  "image-watermark": lazy(() =>
    import("../../../tools/image/image-watermark").then((module) => ({ default: module.ImageWatermarkTool })),
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
  "text-to-pdf": lazy(() =>
    import("../../../tools/pdf/text-to-pdf").then((module) => ({ default: module.TextToPdfTool })),
  ),
  "remove-pdf-pages": lazy(() =>
    import("../../../tools/pdf/remove-pdf-pages").then((module) => ({ default: module.RemovePdfPagesTool })),
  ),
  "add-page-numbers": lazy(() =>
    import("../../../tools/pdf/add-page-numbers").then((module) => ({ default: module.AddPageNumbersTool })),
  ),
  "advanced-word-counter": lazy(() =>
    import("../../../tools/text/advanced-word-counter").then((module) => ({
      default: module.AdvancedWordCounterTool,
    })),
  ),
  "markdown-to-html": lazy(() =>
    import("../../../tools/text/markdown-to-html").then((module) => ({
      default: module.MarkdownToHtmlTool,
    })),
  ),
  "compare-texts": lazy(() =>
    import("../../../tools/text/compare-texts").then((module) => ({
      default: module.CompareTextsTool,
    })),
  ),
};

export function getToolRenderer(toolId: ToolMetadata["id"]) {
  return toolRenderers[toolId];
}
