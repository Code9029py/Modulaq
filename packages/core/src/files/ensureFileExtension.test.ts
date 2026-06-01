import { describe, expect, it } from "vitest";
import { ensureFileExtension } from "./ensureFileExtension";

describe("ensureFileExtension", () => {
  it("agrega extensión cuando el nombre no la tiene", () => {
    expect(ensureFileExtension("informe", "pdf")).toBe("informe.pdf");
  });

  it("reemplaza una extensión conocida pre-existente", () => {
    expect(ensureFileExtension("informe.txt", "pdf")).toBe("informe.pdf");
  });

  it("usa el fallback cuando el input está vacío", () => {
    expect(ensureFileExtension("", "zip", "descarga")).toBe("descarga.zip");
  });

  it("usa el fallback cuando el input es solo whitespace", () => {
    expect(ensureFileExtension("   ", "png", "imagen")).toBe("imagen.png");
  });

  it("cuando no se pasa fallback usa 'archivo' por default", () => {
    expect(ensureFileExtension("", "pdf")).toBe("archivo.pdf");
  });
});
