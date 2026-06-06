import { describe, expect, it } from "vitest";
import {
  buildDataUrl,
  getBase64TextSize,
  inferExtensionFromMime,
  isValidBase64,
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
});
