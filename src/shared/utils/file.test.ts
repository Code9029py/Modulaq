import { describe, expect, it } from "vitest";
import { formatFileSize, isPdfFile, toArrayBuffer } from "./file";

describe("formatFileSize", () => {
  it("devuelve bytes para < 1024", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(1023)).toBe("1023 B");
  });

  it("devuelve kilobytes para 1024 .. 1MB-1", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(1024 * 500)).toBe("500.0 KB");
  });

  it("devuelve megabytes para >= 1 MB", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1.00 MB");
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5.00 MB");
  });
});

describe("isPdfFile", () => {
  it("acepta type application/pdf", () => {
    expect(isPdfFile({ type: "application/pdf", name: "doc" } as File)).toBe(true);
  });

  it("acepta nombres .pdf insensible a mayúsculas", () => {
    expect(isPdfFile({ type: "", name: "DOC.PDF" } as File)).toBe(true);
    expect(isPdfFile({ type: "", name: "doc.pdf" } as File)).toBe(true);
  });

  it("rechaza otros tipos sin .pdf en el nombre", () => {
    expect(isPdfFile({ type: "image/png", name: "img.png" } as File)).toBe(false);
    expect(isPdfFile({ type: "text/plain", name: "notas.txt" } as File)).toBe(false);
  });
});

describe("toArrayBuffer", () => {
  it("Uint8Array completa devuelve ArrayBuffer equivalente", () => {
    const u8 = new Uint8Array([1, 2, 3, 4]);
    const ab = toArrayBuffer(u8);
    expect(ab.byteLength).toBe(4);
    expect(Array.from(new Uint8Array(ab))).toEqual([1, 2, 3, 4]);
  });

  it("Uint8Array slice devuelve solo los bytes del slice", () => {
    const full = new Uint8Array([1, 2, 3, 4, 5]);
    const slice = full.subarray(1, 4);
    const ab = toArrayBuffer(slice);
    expect(ab.byteLength).toBe(3);
    expect(Array.from(new Uint8Array(ab))).toEqual([2, 3, 4]);
  });
});
