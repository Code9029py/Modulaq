# Modulaq V3.0.2 - Growth Execution

> Documento operativo, no de auditoria. Limite: una pagina.
> Regla de control: en dos semanas tiene que existir contenido visible deployado y baseline documentado, no otro plan.

---

## 1. Baseline (pegar numeros reales antes del deploy Growth)

Fecha de registro: `____-__-__` | Rango: ultimos 28 dias (o desde launch si es menor).

Search Console:

- Impresiones totales: `___`
- Clics totales: `___`
- CTR promedio: `___%`
- URLs indexadas / enviadas en sitemap: `___ / 68`
- Top 10 consultas (query, impresiones, posicion): `___`
- Paginas con impresiones (cuantas y cuales): `___`
- Errores de indexacion/cobertura: `___`

Cloudflare Analytics:

- Visitas: `___` | Page views: `___`
- Page load P50: `___ ms` (captura previa: ~1146 ms)
- LCP / CLS / INP: `___` (captura previa: LCP y CLS verdes)
- Top paths de entrada: `___`
- Top paises: `___`
- 4xx / 5xx: `___`

## 2. Fecha de revision y umbrales

- Deploy Growth (PR1): fecha `____-__-__`.
- Revision intermedia: deploy + 30 dias (solo lectura, sin cambios reactivos).
- **Revision de decision: deploy + 90 dias.**

Continuar (al menos 2 de 3):

1. Impresiones crecen mes a mes de forma sostenida.
2. Al menos 1 cluster (PDF-ES o dev-tools) con consultas relevantes en posicion < 30.
3. Mas de 100 clics organicos/mes con tendencia positiva.

Replantear (las 3 juntas):

1. Impresiones planas o erraticas sin tendencia tras 90 dias.
2. Ninguna consulta relevante en ningun cluster.
3. Menos de ~50 clics organicos/mes.

Replantear no es abandonar: es decidir entre pivot dev/SDK, mas tiempo con causa identificada, o congelar como portfolio.

## 3. Alcance del PR1 (contenido visible)

1. **Render visible de `tool.doc` debajo de la herramienta** (las 30 paginas de una vez: el contenido ya existe localizado; es un cambio de componente en `ToolDetailPage`, no redaccion). Orden: herramienta primero, bloques discretos debajo (Para que sirve / Como usarla / Limites / Privacidad). El tab Documentacion puede quedar o apuntar al bloque.
2. **Una linea visible cerca del H1** en herramientas con archivo: "El procesamiento ocurre en tu navegador; no subimos tu archivo." (wording del plan SEO base, ES y EN).
3. **Comprimir PDF**: bloque honesto visible segun `POST_V3_SEO_BASE_CHANGES_PLAN.md` seccion 4.
4. **Metadata**: aplicar titles/descriptions candidatos del plan SEO base, adaptados a ES+EN (el plan es pre-i18n).
5. **Completar `relatedToolIds`**: faltan pdf-to-images, extract-pdf-text, compress-pdf, pdf-page-counter y el bloque imagen (converter, resizer, compressor, rotator, cropper, svg-to-png, favicon, watermark, joiner, splitter).
6. **Opcional unica excepcion**: herramienta Rotar PDF (pdf-lib, bloque PDF). Solo si no retrasa 1-5.

Validacion: `npm run test:run` + `npm run build` + revision visual de 3 paginas en 375/768/1280.

## 4. PR2 (guias, despues del PR1)

5-6 guias artesanales elegidas por baja competencia, no por cobertura:

- Como unir PDFs sin subir archivos (ES)
- Como eliminar paginas de un PDF online (ES)
- Como numerar paginas de un PDF (ES)
- Que significa procesamiento local (ES)
- Image to Base64 / Base64 to image (EN, nicho dev)
- How to create a favicon from an image (EN, nicho dev)

Sin plantillas repetidas. Cada guia: intencion propia, contenido propio, link a la herramienta. No mas de 6 en esta tanda.

## 5. Canal externo (despues del deploy del PR1+PR2)

Un post honesto en un canal dev (r/webdev, dev.to o Show HN): "set de herramientas PDF/imagen 100% locales, sin upload, sin cuenta; documento las limitaciones". Objetivo: feedback, primer trafico no-Google, posibles backlinks. No spam, no multiposting.

## 6. Regla de herramientas nuevas (vigente desde ahora)

Una herramienta nueva entra solo si cumple al menos una:

1. Completa un flujo existente con demanda clara.
2. Responde a una keyword/intencion SEO concreta y poco competida.
3. Mejora una categoria que ya mostro traccion medible.
4. Corrige una ausencia evidente en un bloque fuerte.

"Es facil de hacer" o "completa visualmente la categoria" no son razones validas.

## 7. Fuera de alcance de V3.0.2

No auditoria general, no documentacion de cierre larga, no refactor `tools.ts` (se hace como precondicion del proximo bloque de herramientas, no antes), no performance, no presets masivos, no backend/API/login/monetizacion/npm publish, no DOCX a PDF, no V4.
