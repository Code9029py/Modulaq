import { describe, expect, it } from "vitest";
import { getTextStats } from "./getTextStats";

describe("getTextStats", () => {
  it("texto vacío devuelve ceros en todos los campos", () => {
    expect(getTextStats("")).toEqual({ characters: 0, words: 0, lines: 0 });
  });

  it("texto simple cuenta caracteres, palabras y 1 línea", () => {
    expect(getTextStats("Hola mundo")).toEqual({ characters: 10, words: 2, lines: 1 });
  });

  it("varias líneas suma líneas correctamente", () => {
    expect(getTextStats("uno\ndos\ntres")).toEqual({ characters: 12, words: 3, lines: 3 });
  });

  it("normaliza CRLF al contar líneas", () => {
    expect(getTextStats("a\r\nb").lines).toBe(2);
  });

  it("solo espacios cuenta los caracteres pero 0 palabras", () => {
    const stats = getTextStats("   ");
    expect(stats.characters).toBe(3);
    expect(stats.words).toBe(0);
  });

  it("considera caracteres unicode como uno solo por code unit", () => {
    expect(getTextStats("ñoño").characters).toBe(4);
  });
});
