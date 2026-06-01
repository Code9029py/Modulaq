// Genera todas las fixtures usadas por la suite de tests del SDK.
// Salida determinística: re-ejecutar produce bytes equivalentes (modulo
// metadata interna de pdf-lib). Los binarios resultantes se commitean al repo.
//
// Uso: `node packages/core/test-fixtures/generate.mjs`
//
// No agrega dependencias: pdf-lib ya está en el proyecto.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument, StandardFonts } from "pdf-lib";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..");
const pdfDir = join(here, "pdf");
const imgDir = join(here, "images");
mkdirSync(pdfDir, { recursive: true });
mkdirSync(imgDir, { recursive: true });

function report(absPath, bytes) {
  console.log(`  ${relative(repoRoot, absPath).replace(/\\/g, "/")}  (${bytes.length} B)`);
}

async function makePdfWithTexts(texts) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (const text of texts) {
    const page = pdf.addPage([200, 200]);
    page.drawText(text, { x: 20, y: 100, size: 16, font });
  }
  return pdf.save();
}

function decodeBase64(base64) {
  return new Uint8Array(Buffer.from(base64, "base64"));
}

console.log("PDFs:");
{
  const bytes = await makePdfWithTexts(["Hello SDK"]);
  const out = join(pdfDir, "text-simple-1p.pdf");
  writeFileSync(out, bytes);
  report(out, bytes);
}
{
  const bytes = await makePdfWithTexts(["Page 1", "Page 2", "Page 3"]);
  const out = join(pdfDir, "text-multi-3p.pdf");
  writeFileSync(out, bytes);
  report(out, bytes);
}
{
  const bytes = await makePdfWithTexts(["Page 1", "Page 2", "Page 3", "Page 4", "Page 5"]);
  const out = join(pdfDir, "text-multi-5p.pdf");
  writeFileSync(out, bytes);
  report(out, bytes);
}

console.log("\nImages:");
// 1x1 PNG (transparente, 67 B). PNG válido aceptado por pdf-lib.embedPng.
{
  const png = decodeBase64(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  );
  const out = join(imgDir, "tiny.png");
  writeFileSync(out, png);
  report(out, png);
}
// 1x1 JPEG con tablas de cuantización y Huffman estándar. ~660 B.
// Aceptado por pdf-lib.embedJpg porque tiene SOF + DHT + DQT bien formados.
{
  const jpg = decodeBase64(
    "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+/uiiigD/2Q==",
  );
  const out = join(imgDir, "tiny.jpg");
  writeFileSync(out, jpg);
  report(out, jpg);
}

console.log("\nListo.");
