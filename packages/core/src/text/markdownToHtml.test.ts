import { describe, expect, it } from "vitest";
import { markdownToHtml } from "./markdownToHtml";

describe("markdownToHtml", () => {
  it("convierte headings de 1 a 6 niveles", () => {
    expect(markdownToHtml("# Hola").html).toBe("<h1>Hola</h1>");
    expect(markdownToHtml("### Tres").html).toBe("<h3>Tres</h3>");
    expect(markdownToHtml("###### Seis").html).toBe("<h6>Seis</h6>");
  });

  it("aplica bold e italic", () => {
    expect(markdownToHtml("**fuerte**").html).toBe("<p><strong>fuerte</strong></p>");
    expect(markdownToHtml("*itálico*").html).toBe("<p><em>itálico</em></p>");
    expect(markdownToHtml("__también fuerte__").html).toBe(
      "<p><strong>también fuerte</strong></p>",
    );
  });

  it("convierte links seguros y filtra esquemas peligrosos", () => {
    const safe = markdownToHtml("[Modulaq](https://modulaq.dev)").html;
    expect(safe).toBe('<p><a href="https://modulaq.dev">Modulaq</a></p>');

    const jsLink = markdownToHtml("[bad](javascript:alert)").html;
    expect(jsLink).toBe('<p><a href="#">bad</a></p>');
  });

  it("convierte listas desordenadas y ordenadas", () => {
    const ul = markdownToHtml("- uno\n- dos\n- tres").html;
    expect(ul).toBe("<ul><li>uno</li><li>dos</li><li>tres</li></ul>");

    const ol = markdownToHtml("1. a\n2. b\n3. c").html;
    expect(ol).toBe("<ol><li>a</li><li>b</li><li>c</li></ol>");
  });

  it("genera code inline y code block con lenguaje", () => {
    const inline = markdownToHtml("usá `npm run dev`").html;
    expect(inline).toBe("<p>usá <code>npm run dev</code></p>");

    const block = markdownToHtml("```ts\nconst x = 1;\n```").html;
    expect(block).toBe(
      '<pre><code class="language-ts">const x = 1;</code></pre>',
    );
  });

  it("genera blockquote y soporta inline anidado", () => {
    const md = "> texto **fuerte** del quote\n> segunda línea";
    const html = markdownToHtml(md).html;
    expect(html).toBe(
      "<blockquote><p>texto <strong>fuerte</strong> del quote<br />segunda línea</p></blockquote>",
    );
  });

  it("modo fragmento devuelve solo el HTML sin doctype", () => {
    const result = markdownToHtml("# Hola");
    expect(result.isDocument).toBe(false);
    expect(result.html.includes("<!DOCTYPE html>")).toBe(false);
  });

  it("modo documento completo envuelve con html, head y body", () => {
    const result = markdownToHtml("# Hola", { document: true, title: "Mi doc" });
    expect(result.isDocument).toBe(true);
    expect(result.html).toContain("<!DOCTYPE html>");
    expect(result.html).toContain("<title>Mi doc</title>");
    expect(result.html).toContain("<h1>Hola</h1>");
  });

  it("escapa HTML embebido y no ejecuta scripts", () => {
    const result = markdownToHtml("<script>alert(1)</script>");
    expect(result.html).toBe("<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>");
  });

  it("texto vacío produce string vacío", () => {
    expect(markdownToHtml("").html).toBe("");
    expect(markdownToHtml("   \n\n  ").html).toBe("");
  });
});
