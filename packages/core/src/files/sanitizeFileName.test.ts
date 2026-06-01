import { describe, expect, it } from "vitest";
import { sanitizeFileName } from "./sanitizeFileName";

describe("sanitizeFileName", () => {
  it("reemplaza caracteres prohibidos por '-'", () => {
    expect(sanitizeFileName("foo<>bar:baz")).toBe("foo--bar-baz");
  });

  it("input vacío usa el fallback por default", () => {
    expect(sanitizeFileName("")).toBe("archivo");
  });

  it("input vacío respeta fallback custom", () => {
    expect(sanitizeFileName("", "mi-base")).toBe("mi-base");
  });

  it("input solo whitespace usa fallback", () => {
    expect(sanitizeFileName("   ")).toBe("archivo");
  });

  it("nombres reservados de Windows reciben sufijo '-archivo'", () => {
    expect(sanitizeFileName("CON")).toBe("CON-archivo");
    expect(sanitizeFileName("lpt1")).toBe("lpt1-archivo");
    expect(sanitizeFileName("nul")).toBe("nul-archivo");
  });

  it("colapsa whitespace múltiple a uno", () => {
    expect(sanitizeFileName("a    b   c")).toBe("a b c");
  });

  it("quita extensiones conocidas pegadas al nombre", () => {
    expect(sanitizeFileName("informe.pdf")).toBe("informe");
    expect(sanitizeFileName("notas.txt")).toBe("notas");
    expect(sanitizeFileName("paquete.zip")).toBe("paquete");
  });

  it("recorta puntos y espacios finales", () => {
    expect(sanitizeFileName("nombre...   ")).toBe("nombre");
  });
});
