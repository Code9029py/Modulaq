import { describe, expect, it } from "vitest";
import {
  buildDataUrl,
  getBase64TextSize,
  inferExtensionFromMime,
  isValidBase64,
  parseBase64ImageInput,
  parseDataUrl,
  stripDataUrlPrefix,
} from "./imageBase64.service";

const pngBase64 = "iVBORw0KGgo=";
const pngDataUrl = `data:image/png;base64,${pngBase64}`;

describe("imageBase64.service", () => {
  it("parses a valid Data URL", () => {
    expect(parseDataUrl(pngDataUrl)).toEqual({
      base64: pngBase64,
      mimeType: "image/png",
    });
  });

  it("rejects invalid Data URLs", () => {
    expect(parseDataUrl("data:;base64,abc")).toBeNull();
    expect(parseDataUrl("data:image/png,abc")).toBeNull();
    expect(parseDataUrl("data:image/png;base64,@@@")).toBeNull();
  });

  it("validates plain Base64 input", () => {
    expect(isValidBase64(pngBase64)).toBe(true);
    expect(isValidBase64("SGVsbG8=")).toBe(true);
    expect(isValidBase64("not base64")).toBe(false);
    expect(isValidBase64("abc")).toBe(false);
  });

  it("strips Data URL prefix when present", () => {
    expect(stripDataUrlPrefix(pngDataUrl)).toBe(pngBase64);
    expect(stripDataUrlPrefix(pngBase64)).toBe(pngBase64);
  });

  it("builds Data URLs", () => {
    expect(buildDataUrl(pngBase64, "image/png")).toBe(pngDataUrl);
  });

  it("infers extension from MIME", () => {
    expect(inferExtensionFromMime("image/png")).toBe("png");
    expect(inferExtensionFromMime("image/jpeg")).toBe("jpg");
    expect(inferExtensionFromMime("image/webp")).toBe("webp");
    expect(inferExtensionFromMime("text/plain")).toBeNull();
  });

  it("calculates generated text size", () => {
    expect(getBase64TextSize(pngBase64)).toBe(pngBase64.length);
    expect(getBase64TextSize(pngBase64, "image/png")).toBe(pngDataUrl.length);
  });

  it("rebuilds an image result from a Data URL using the detected MIME", () => {
    const result = parseBase64ImageInput(pngDataUrl, "image/jpeg");

    expect(result.mimeType).toBe("image/png");
    expect(result.base64).toBe(pngBase64);
    expect(result.fileName).toBe("imagen-reconstruida.png");
    expect(result.dataUrl).toBe(pngDataUrl);
  });

  it("rebuilds an image result from plain Base64 using the selected MIME", () => {
    const result = parseBase64ImageInput(pngBase64, "image/webp");

    expect(result.mimeType).toBe("image/webp");
    expect(result.extension).toBe("webp");
    expect(result.fileName).toBe("imagen-reconstruida.webp");
  });

  it("rejects unsupported Data URL MIME types", () => {
    expect(() => parseBase64ImageInput(`data:text/plain;base64,${pngBase64}`, "image/png")).toThrow(
      "La Data URL debe usar image/png, image/jpeg o image/webp.",
    );
  });
});
