import { describe, expect, it } from "vitest";
import { buildQrValue } from "./buildQrValue";

describe("buildQrValue", () => {
  it("text devuelve el input recortado, sin prefijo", () => {
    expect(buildQrValue("text", "  hola mundo  ")).toBe("hola mundo");
  });

  it("url devuelve el input recortado, sin prefijo agregado", () => {
    expect(buildQrValue("url", "  https://modulaq.dev ")).toBe("https://modulaq.dev");
  });

  it("email agrega prefijo mailto:", () => {
    expect(buildQrValue("email", "  hola@modulaq.dev")).toBe("mailto:hola@modulaq.dev");
  });

  it("phone agrega prefijo tel: y quita todos los espacios internos", () => {
    expect(buildQrValue("phone", "+595 981 000 000")).toBe("tel:+595981000000");
  });

  it("phone preserva +, guiones y paréntesis pero quita espacios", () => {
    expect(buildQrValue("phone", " +54 (11) 1234-5678 ")).toBe("tel:+54(11)1234-5678");
  });
});
