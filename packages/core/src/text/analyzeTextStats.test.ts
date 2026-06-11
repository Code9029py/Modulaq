import { describe, expect, it } from "vitest";
import { analyzeTextStats } from "./analyzeTextStats";

describe("analyzeTextStats", () => {
  it("texto vacío devuelve ceros", () => {
    const stats = analyzeTextStats("");
    expect(stats).toEqual({
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      lines: 0,
      paragraphs: 0,
      sentences: 0,
      readingTimeSeconds: 0,
      wordsPerMinute: 200,
    });
  });

  it("cuenta palabras, caracteres con y sin espacios", () => {
    const stats = analyzeTextStats("Hola mundo");
    expect(stats.words).toBe(2);
    expect(stats.characters).toBe(10);
    expect(stats.charactersNoSpaces).toBe(9);
    expect(stats.lines).toBe(1);
  });

  it("cuenta varias líneas y normaliza CRLF", () => {
    const stats = analyzeTextStats("uno\r\ndos\r\ntres");
    expect(stats.lines).toBe(3);
    expect(stats.words).toBe(3);
  });

  it("detecta párrafos separados por línea vacía", () => {
    const text = "primer párrafo.\n\nsegundo párrafo.\n\n\ntercer párrafo.";
    const stats = analyzeTextStats(text);
    expect(stats.paragraphs).toBe(3);
  });

  it("aproxima frases con . ! ? y termina con texto pendiente", () => {
    const stats = analyzeTextStats("Hola. ¿Cómo estás? Bien!");
    expect(stats.sentences).toBe(3);

    const trailing = analyzeTextStats("Esto es una frase sin punto");
    expect(trailing.sentences).toBe(1);

    const multiple = analyzeTextStats("Hola! Mundo. Otra frase pendiente");
    expect(multiple.sentences).toBe(3);
  });

  it("calcula tiempo de lectura con 200 wpm por defecto", () => {
    const text = Array.from({ length: 400 }, (_, index) => `palabra${index}`).join(" ");
    const stats = analyzeTextStats(text);
    expect(stats.words).toBe(400);
    // 400 palabras a 200 wpm => 2 minutos => 120 segundos
    expect(stats.readingTimeSeconds).toBe(120);
  });

  it("respeta wordsPerMinute custom", () => {
    const text = "uno dos tres cuatro cinco";
    const stats = analyzeTextStats(text, { wordsPerMinute: 100 });
    // 5 palabras a 100 wpm => 3 segundos (redondeo a la cota mínima de 1s)
    expect(stats.readingTimeSeconds).toBe(3);
    expect(stats.wordsPerMinute).toBe(100);
  });

  it("textos cortos no devuelven 0 segundos cuando hay palabras", () => {
    const stats = analyzeTextStats("una sola");
    expect(stats.readingTimeSeconds).toBeGreaterThanOrEqual(1);
  });

  it("solo espacios no cuenta palabras pero sí caracteres", () => {
    const stats = analyzeTextStats("   ");
    expect(stats.words).toBe(0);
    expect(stats.characters).toBe(3);
    expect(stats.charactersNoSpaces).toBe(0);
    expect(stats.paragraphs).toBe(0);
    expect(stats.sentences).toBe(0);
  });
});
