import { describe, expect, it } from "vitest";
import { getBaseFileName } from "./getBaseFileName";

describe("getBaseFileName", () => {
  it("quita la última extensión", () => {
    expect(getBaseFileName("informe.pdf")).toBe("informe");
  });

  it("conserva puntos intermedios y solo quita la última extensión", () => {
    expect(getBaseFileName("backup.2024.pdf")).toBe("backup.2024");
  });

  it("sin extensión devuelve el nombre tal cual", () => {
    expect(getBaseFileName("README")).toBe("README");
  });

  it("ignora directorios con '/' o '\\\\'", () => {
    expect(getBaseFileName("docs/informe.pdf")).toBe("informe");
    expect(getBaseFileName("docs\\winpath.pdf")).toBe("winpath");
  });

  it("nombres que empiezan con '.' (dotfiles) no se tratan como extensión sola", () => {
    expect(getBaseFileName(".env")).toBe(".env");
  });
});
