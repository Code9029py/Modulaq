import { describe, expect, it } from "vitest";
import {
  maximumCustomQrSize,
  minimumCustomQrSize,
  qrSizePixels,
  resolveQrOutputSize,
} from "./resolveQrOutputSize";

describe("resolveQrOutputSize", () => {
  it("preset 'small' devuelve los píxeles correspondientes", () => {
    expect(resolveQrOutputSize("small", "")).toEqual({ error: null, pixels: qrSizePixels.small });
  });

  it("preset 'medium' devuelve los píxeles correspondientes", () => {
    expect(resolveQrOutputSize("medium", "")).toEqual({ error: null, pixels: qrSizePixels.medium });
  });

  it("preset 'large' devuelve los píxeles correspondientes", () => {
    expect(resolveQrOutputSize("large", "")).toEqual({ error: null, pixels: qrSizePixels.large });
  });

  it("custom válido (800) devuelve 800 sin error", () => {
    expect(resolveQrOutputSize("custom", "800")).toEqual({ error: null, pixels: 800 });
  });

  it("custom vacío menciona el rango permitido", () => {
    const result = resolveQrOutputSize("custom", "");
    expect(result.pixels).toBeNull();
    expect(result.error).toContain(String(minimumCustomQrSize));
    expect(result.error).toContain(String(maximumCustomQrSize));
  });

  it("custom no numérico es error explícito", () => {
    const result = resolveQrOutputSize("custom", "abc");
    expect(result.pixels).toBeNull();
    expect(result.error).toMatch(/numérico/i);
  });

  it("custom menor al mínimo menciona el límite", () => {
    const result = resolveQrOutputSize("custom", "50");
    expect(result.pixels).toBeNull();
    expect(result.error).toContain(String(minimumCustomQrSize));
  });

  it("custom mayor al máximo menciona el límite", () => {
    const result = resolveQrOutputSize("custom", "5000");
    expect(result.pixels).toBeNull();
    expect(result.error).toContain(String(maximumCustomQrSize));
  });

  it("custom igual al mínimo es válido", () => {
    expect(resolveQrOutputSize("custom", String(minimumCustomQrSize))).toEqual({
      error: null,
      pixels: minimumCustomQrSize,
    });
  });

  it("custom igual al máximo es válido", () => {
    expect(resolveQrOutputSize("custom", String(maximumCustomQrSize))).toEqual({
      error: null,
      pixels: maximumCustomQrSize,
    });
  });
});
