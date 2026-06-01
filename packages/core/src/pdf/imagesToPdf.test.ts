import { describe, expect, it } from "vitest";
import { countPdfPages } from "./countPdfPages";
import { imagesToPdf } from "./imagesToPdf";
import { loadImageFixture } from "../../test-fixtures/load";

describe("imagesToPdf", () => {
  it("1 PNG produce un PDF de 1 página", async () => {
    const png = loadImageFixture("tiny.png");
    const pdf = await imagesToPdf([{ bytes: png, format: "png" }]);
    expect(pdf).toBeInstanceOf(Uint8Array);
    expect(await countPdfPages(pdf)).toBe(1);
  });

  it("1 JPG produce un PDF de 1 página", async () => {
    const jpg = loadImageFixture("tiny.jpg");
    const pdf = await imagesToPdf([{ bytes: jpg, format: "jpg" }]);
    expect(await countPdfPages(pdf)).toBe(1);
  });

  it("PNG + JPG mixtos producen un PDF de 2 páginas", async () => {
    const png = loadImageFixture("tiny.png");
    const jpg = loadImageFixture("tiny.jpg");
    const pdf = await imagesToPdf([
      { bytes: png, format: "png" },
      { bytes: jpg, format: "jpg" },
    ]);
    expect(await countPdfPages(pdf)).toBe(2);
  });

  it("array vacío lanza error", async () => {
    await expect(imagesToPdf([])).rejects.toThrow();
  });
});
