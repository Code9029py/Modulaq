import { describe, expect, it } from "vitest";
import { validateQrInput } from "./validateQrInput";

describe("validateQrInput", () => {
  it("input vacío nunca es warning", () => {
    expect(validateQrInput("text", "")).toEqual({ isWarning: false, message: null });
    expect(validateQrInput("url", "")).toEqual({ isWarning: false, message: null });
    expect(validateQrInput("email", "")).toEqual({ isWarning: false, message: null });
    expect(validateQrInput("phone", "")).toEqual({ isWarning: false, message: null });
  });

  it("url válida con https pasa sin warning", () => {
    expect(validateQrInput("url", "https://modulaq.dev")).toEqual({ isWarning: false, message: null });
  });

  it("url sin https devuelve warning", () => {
    const result = validateQrInput("url", "modulaq.dev");
    expect(result.isWarning).toBe(true);
    expect(result.message).toMatch(/https/i);
  });

  it("email válido pasa sin warning", () => {
    expect(validateQrInput("email", "hola@modulaq.dev")).toEqual({ isWarning: false, message: null });
  });

  it("email sin @ es warning", () => {
    expect(validateQrInput("email", "no-es-email").isWarning).toBe(true);
  });

  it("teléfono válido (números, +, espacios, -, paréntesis) pasa sin warning", () => {
    expect(validateQrInput("phone", "+54 (11) 1234-5678")).toEqual({ isWarning: false, message: null });
  });

  it("teléfono con caracteres no permitidos es warning", () => {
    expect(validateQrInput("phone", "abc!@").isWarning).toBe(true);
  });

  it("text siempre pasa, sin importar el contenido", () => {
    expect(validateQrInput("text", "cualquier @#! cosa")).toEqual({ isWarning: false, message: null });
  });
});
