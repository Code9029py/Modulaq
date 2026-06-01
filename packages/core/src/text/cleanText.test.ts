import { describe, expect, it } from "vitest";
import { cleanText, defaultTextCleanOptions } from "./cleanText";
import type { TextCleanOptions } from "./types";

const noneEnabled: TextCleanOptions = {
  removeMultipleSpaces: false,
  removeExtraLineBreaks: false,
  trimEdges: false,
  normalizeQuotes: false,
  removeInvisibleCharacters: false,
  collapseEmptyLines: false,
};

describe("cleanText", () => {
  it("colapsa espacios múltiples cuando removeMultipleSpaces=true", () => {
    expect(cleanText("hola    mundo", { ...noneEnabled, removeMultipleSpaces: true })).toBe("hola mundo");
  });

  it("no toca espacios cuando removeMultipleSpaces=false", () => {
    expect(cleanText("hola    mundo", noneEnabled)).toBe("hola    mundo");
  });

  it("colapsa saltos extra cuando collapseEmptyLines=true", () => {
    expect(cleanText("a\n\n\n\nb", { ...noneEnabled, collapseEmptyLines: true })).toBe("a\n\nb");
  });

  it("colapsa whitespace alrededor de saltos cuando removeExtraLineBreaks=true", () => {
    expect(cleanText("a   \n   b", { ...noneEnabled, removeExtraLineBreaks: true })).toBe("a\nb");
  });

  it("recorta extremos cuando trimEdges=true", () => {
    expect(cleanText("   hola   ", { ...noneEnabled, trimEdges: true })).toBe("hola");
  });

  it("normaliza comillas tipográficas cuando normalizeQuotes=true", () => {
    expect(cleanText("“Hola” y ‘mundo’", { ...noneEnabled, normalizeQuotes: true })).toBe(
      "\"Hola\" y 'mundo'",
    );
  });

  it("elimina caracteres invisibles cuando removeInvisibleCharacters=true", () => {
    expect(cleanText("a​b", { ...noneEnabled, removeInvisibleCharacters: true })).toBe("ab");
  });

  it("preserva caracteres invisibles cuando removeInvisibleCharacters=false", () => {
    expect(cleanText("a​b", noneEnabled)).toBe("a​b");
  });

  it("normaliza CRLF a LF aunque ninguna opción esté activa", () => {
    expect(cleanText("a\r\nb\rc", noneEnabled)).toBe("a\nb\nc");
  });

  it("aplica todas las opciones por default combinadas", () => {
    const input = "  hola    mundo  \n\n\n\n​x “test”  ";
    expect(cleanText(input, defaultTextCleanOptions)).toBe("hola mundo\n\nx \"test\"");
  });

  it("input vacío devuelve vacío", () => {
    expect(cleanText("", defaultTextCleanOptions)).toBe("");
  });
});
