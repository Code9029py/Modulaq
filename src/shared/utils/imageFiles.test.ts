import { describe, expect, it } from "vitest";
import {
  buildImageDownloadFileName,
  buildBrowserImageDownloadFileName,
  buildImageZipDownloadFileName,
  buildPagedImageFileName,
  getBrowserImageMimeType,
  getBrowserImageOutputExtension,
  getBrowserImageOutputMimeType,
  getImageDownloadBaseName,
  getImageOutputExtension,
  getImageOutputMimeType,
  isBrowserImageFile,
  jpegQualityDecimalToPercent,
  jpegQualityPercentToDecimal,
  normalizeJpegQuality,
} from "./imageFiles";

describe("imageFiles", () => {
  it("maps image output formats to extension and MIME", () => {
    expect(getImageOutputExtension("png")).toBe("png");
    expect(getImageOutputMimeType("png")).toBe("image/png");
    expect(getImageOutputExtension("jpeg")).toBe("jpg");
    expect(getImageOutputMimeType("jpeg")).toBe("image/jpeg");
    expect(getBrowserImageOutputExtension("webp")).toBe("webp");
    expect(getBrowserImageOutputMimeType("webp")).toBe("image/webp");
  });

  it("normalizes JPEG quality to the supported range", () => {
    expect(normalizeJpegQuality(undefined)).toBe(0.92);
    expect(normalizeJpegQuality(0)).toBe(0.1);
    expect(normalizeJpegQuality(1.5)).toBe(1);
    expect(normalizeJpegQuality(0.4)).toBe(0.4);
  });

  it("converts JPEG quality between percent and decimal", () => {
    expect(jpegQualityPercentToDecimal(10)).toBe(0.1);
    expect(jpegQualityPercentToDecimal(92)).toBe(0.92);
    expect(jpegQualityPercentToDecimal(100)).toBe(1);
    expect(jpegQualityDecimalToPercent(0.92)).toBe(92);
  });

  it("builds output names with the selected image extension", () => {
    expect(buildImageDownloadFileName("documento", "png", "paginas-pdf")).toBe("documento.png");
    expect(buildImageDownloadFileName("documento", "jpeg", "paginas-pdf")).toBe("documento.jpg");
    expect(buildImageDownloadFileName("foto.jpeg", "jpeg", "paginas-pdf")).toBe("foto.jpg");
    expect(buildBrowserImageDownloadFileName("foto.png", "webp", "imagen")).toBe("foto.webp");
    expect(buildImageZipDownloadFileName("foto.jpg", "paginas-pdf")).toBe("foto.zip");
  });

  it("builds page file names using the selected image extension", () => {
    const baseName = getImageDownloadBaseName("reporte.pdf", "paginas-pdf");

    expect(buildPagedImageFileName(baseName, 2, 12, "png")).toBe("reporte-pagina-02.png");
    expect(buildPagedImageFileName(baseName, 2, 12, "jpeg")).toBe("reporte-pagina-02.jpg");
  });

  it("detects supported browser image MIME types by type or extension", () => {
    expect(getBrowserImageMimeType({ type: "image/png", name: "archivo" } as File)).toBe("image/png");
    expect(getBrowserImageMimeType({ type: "", name: "foto.JPG" } as File)).toBe("image/jpeg");
    expect(getBrowserImageMimeType({ type: "", name: "foto.webp" } as File)).toBe("image/webp");
    expect(isBrowserImageFile({ type: "text/plain", name: "notas.txt" } as File)).toBe(false);
  });
});
