import { describe, expect, it } from "vitest";
import { generateQrDataUrl } from "./generateQrDataUrl";

describe("generateQrDataUrl", () => {
  it("devuelve un data URL PNG por default", async () => {
    const dataUrl = await generateQrDataUrl("hello", { size: 128 });
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    expect(dataUrl.length).toBeGreaterThan(100);
  });

  it("size mayor produce un data URL más largo", async () => {
    const small = await generateQrDataUrl("https://modulaq.dev", { size: 64 });
    const large = await generateQrDataUrl("https://modulaq.dev", { size: 512 });
    expect(small).toMatch(/^data:image\/png;/);
    expect(large).toMatch(/^data:image\/png;/);
    expect(large.length).toBeGreaterThan(small.length);
  });

  it("acepta colores custom (no lanza)", async () => {
    const dataUrl = await generateQrDataUrl("x", {
      size: 64,
      dark: "#000000",
      light: "#ffffff",
    });
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it("input vacío es rechazado por la librería qrcode", async () => {
    await expect(generateQrDataUrl("", { size: 64 })).rejects.toThrow();
  });
});
