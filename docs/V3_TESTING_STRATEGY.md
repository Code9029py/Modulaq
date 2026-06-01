# Modulaq — Estrategia de testing del SDK y de la app

> Documento de **planificación**, no de implementación.
> No modifica código, dependencias, herramientas, SSG ni versión.
> Continúa el cierre de V3.1 ([V3_1_PLAN.md](./V3_1_PLAN.md)) y precede cualquier
> decisión de tests/npm/V3.2.

---

## 1. Estado actual del SDK

### Módulos en `@modulaq/core` (V3.1 cerrada)

| Subpath | Funciones públicas | Deps peer |
|---|---|---|
| `/text` | `cleanText`, `getTextStats`, `defaultTextCleanOptions` | — |
| `/qr` | `buildQrValue`, `validateQrInput`, `resolveQrOutputSize`, `generateQrDataUrl` (+ constantes/sizes) | `qrcode` |
| `/pdf` | `countPdfPages`, `mergePdfs`, `reorderPdfPages`, `extractPdfPages`, `splitPdfRange`, `imagesToPdf` | `pdf-lib` |
| `/pdf-render` | `configurePdfWorker`, `extractPdfText`, `pdfToImages` | `pdfjs-dist` |
| `/files` | `sanitizeFileName`, `ensureFileExtension`, `getBaseFileName`, `DownloadExtension` | — |
| `/ranges` | `parsePageSelection`, `PageSelectionResult` | — |

### Herramientas que consumen el SDK (vía thin adapters)

| Herramienta | Subpaths que usa |
|---|---|
| Limpiador de texto | `/text` |
| Generador de QR | `/qr` |
| Contador de páginas PDF | `/pdf` |
| Unir PDFs | `/pdf` |
| Dividir PDF | `/pdf` + `/ranges` (parse) |
| Reordenar páginas PDF | `/pdf` |
| Imagen a PDF | `/pdf` |
| Extraer texto de PDF | `/pdf-render` |
| PDF a imágenes | `/pdf` (metadata) + `/pdf-render` |
| Comprimir PDF | **no consume el SDK** (excluido por decisión de V2) |

### Cobertura funcional alcanzada

- **Build verde** en todas las olas.
- **QA manual** sobre las 9 herramientas migradas (texto, qr, 5 pdf-lib, 1 pdfjs-dist).
- **Inspección de código**: la lógica del SDK es lift logic-preserving desde los `*.service.ts` originales que sí estuvieron en producción durante V2.
- **Tests automatizados: cero.**

---

## 2. Objetivos del testing

1. **Proteger regresiones** al refactorizar el SDK o agregar funciones.
2. **Validar adapters** donde la lógica UX-específica (Spanish errors, nombres de archivo, ZIP packaging, heurísticas) no está cubierta por los tests del SDK.
3. **Validar el SDK** como contrato público estable antes de cualquier npm public.
4. **Aumentar confianza** suficiente para abrir V3.2 y considerar publicación.
5. **Documentar el comportamiento esperado** — los tests son la spec ejecutable del SDK.

---

## 3. Niveles de testing

### Unit tests
Funciones puras (sin DOM, sin worker, sin filesystem). Ejecutan en Node.
**Cubre:** `text`, `qr` (build/validate/resolve), `files`, `ranges`.

### Integration tests
Funciones que necesitan APIs del navegador o un PDF real procesado de punta a
punta. **Cubre:** `pdf` (pdf-lib + bytes reales), `pdf-render` (pdfjs + worker +
canvas), `qr/generateQrDataUrl` (qrcode produce data URL real).
Pueden correr en Node con polyfills (`happy-dom` para `pdf`) o requerir browser
real (`@vitest/browser` para `pdf-render` por el worker y canvas).

### Manual QA
Las herramientas en el sitio, con PDFs/imágenes/textos del mundo real, en los
navegadores soportados. **Cubre:** la integración SDK→adapter→React→deploy, la
UX (descargas, mensajes en español, progreso visual) y los edge cases que
ningún test unitario o de integración alcanza realísticamente.

---

## 4. Priorización

### Alta prioridad — protege contratos públicos del SDK
- Cubrir 100 % de funciones puras (text, qr salvo `generateQrDataUrl`, files, ranges).
- Cubrir los **errores tirados** explícitamente por el SDK (cada `throw new Error(...)`).
- Cubrir el path de `pdf-lib` (PDF binario in/out): merge, reorder, count, split-range, extract-pages, images-to-pdf.

### Media prioridad — valida pdfjs y comportamiento browser
- `extractPdfText` y `pdfToImages` con PDFs reales (fixtures).
- `configurePdfWorker` (validar el guard `ensureWorkerConfigured`).
- `generateQrDataUrl` (output válido como data URL, dimensiones aprox.).

### Baja prioridad — adapters de la app
- Adapters que solo orquestan o renombran (ej. `pdf-page-counter`, `merge-pdf`).
- UI/componentes React (no es nuestro foco; manual QA basta).
- `compressPdf` adapter (excluido del SDK y de público; tests no aportan).

---

## 5. Unit tests recomendados — `text`, `qr`, `files`, `ranges`

### `text`
- `cleanText`: una prueba por **cada opción individual** (6 booleanos) → 6 tests + 1 "todas activas" + 1 "ninguna activa" (input == output salvo normalización CRLF).
- `cleanText`: input vacío → output vacío.
- `cleanText`: input con `​` invisible → se elimina cuando `removeInvisibleCharacters: true`, se conserva cuando `false`.
- `cleanText`: comillas tipográficas `"Hola"` → comillas rectas cuando `normalizeQuotes: true`.
- `getTextStats`: vacío → `{0,0,0}`; texto simple "Hola mundo" → `{10, 2, 1}`; multi-línea CRLF normaliza.

### `qr`
- `buildQrValue`: cada `contentType` (text/url/email/phone) con espacios → prefijo correcto (`mailto:`, `tel:` sin espacios).
- `validateQrInput`: caso vacío → `{isWarning:false, message:null}`; URL sin https → warning; email inválido → warning; teléfono con `!@#` → warning; cada uno válido → `null`.
- `resolveQrOutputSize`: cada preset → pixels correctos; `custom` con `""`/`"abc"`/`"50"`/`"3000"`/`"800"` → mensajes y `pixels` correctos.

### `files`
- `sanitizeFileName`: caracteres prohibidos (`<>:"/\|?*`) → reemplazados por `-`; control characters U+0000–U+001F → reemplazados; nombres reservados Windows (`CON`, `PRN`, `LPT1`) → reciben sufijo `-archivo`; input vacío → fallback.
- `ensureFileExtension`: nombre sin extensión → agrega; con extensión distinta → reemplaza la conocida (`.pdf`, `.png`, `.txt`, `.zip`); fallback funciona.
- `getBaseFileName`: con extensión → la quita; con ruta → solo el nombre; sin extensión → idéntico.

### `ranges`
- `parsePageSelection`: input vacío → error; rango válido `"1-3,5,8-10"` con totalPages=10 → pages correcto y `isOutOfOrder:false`; orden invertido `"5,1"` → `isOutOfOrder:true`; rango fuera (`"1-20"` con total 10) → error; duplicado `"1,1,2"` → deduplicado; rango invertido `"5-1"` → error; token inválido `"a"` → error; rango `"5-5"` → `[5]`.

**Total estimado para esta sección: ~45–60 tests cortos**, sin fixtures binarias, todos puros. Corren en milisegundos.

---

## 6. Unit/Integration tests PDF (`@modulaq/core/pdf`)

Estas funciones requieren `pdf-lib` real y un PDF de entrada en bytes — no son puras en sentido estricto pero sí determinísticas con fixtures fijas. Se ejecutan en Node sin DOM.

### `countPdfPages`
- PDF de 1 página → 1.
- PDF de 5 páginas → 5.
- PDF encriptado (lecturable con `ignoreEncryption`) → cuenta OK.
- Bytes basura → throw.

### `mergePdfs`
- 2 PDFs (1 página + 2 páginas) → PDF de 3 páginas. Verificar contando.
- 0 inputs → throw.
- Orden del array preservado: merge `[A, B]` ≠ `[B, A]` (verificar contando metadata o re-extrayendo texto).

### `splitPdfRange` / `extractPdfPages`
- PDF de 5 páginas, `{from:2, to:4}` → 3 páginas.
- Rango inválido `{from:0, to:3}` → throw; `{from:4, to:2}` → throw.
- `extractPdfPages` con `[1,3,5]` → 3 páginas en ese orden.

### `reorderPdfPages`
- PDF de 3 páginas, orden `[3,1,2]` → 3 páginas (en nuevo orden). Validar usando `extractPdfText` sobre el resultado y comparando el texto reordenado.
- Orden vacío → throw.

### `imagesToPdf`
- 1 PNG → PDF de 1 página.
- 2 imágenes (PNG + JPG) → PDF de 2 páginas.
- 0 inputs → throw.
- Input con `{ bytes, format }` (camino "no DOM") → válido.
- Input PNG bajo File → válido.

### `extractPdfText` (`@modulaq/core/pdf-render`)
- PDF text-only (fixture conocido) → texto contiene strings esperados.
- PDF "scanned" (imagen sin texto seleccionable) → `pages` con strings vacíos.
- Sin worker configurado → throw con mensaje exacto que documenta `configurePdfWorker`.
- Bytes basura → throw.

### `pdfToImages`
- 1 página PNG → array de 1 con `bytes` (PNG magic bytes `89 50 4E 47`), `width`/`height` > 0.
- 1 página JPEG con `quality: 0.5` → `bytes` con JPEG magic bytes (`FF D8 FF`).
- Multipágina (3 páginas) con `pages: [1,3]` → array de 2.
- Página fuera de rango → throw.
- Sin worker → throw.
- `scale: 1` vs `scale: 3` → segundo más grande (relación cuadrática de bytes).

### Fixtures necesarias (binarias, committed)
- `text-simple-1p.pdf` (~1 KB) — 1 página, texto "Hello Modulaq" para test de count + extract.
- `text-multi-3p.pdf` (~3 KB) — 3 páginas con texto distinto cada una ("Page 1", "Page 2", "Page 3") — para merge/split/reorder/extract multipágina.
- `text-multi-5p.pdf` (~5 KB) — 5 páginas para split/range/extract.
- `scanned-1p.pdf` (~10–30 KB) — imagen embebida sin texto seleccionable para extract.
- `encrypted-readable.pdf` — encriptado con permiso de lectura para `ignoreEncryption`.
- `garbage.bin` — bytes random para forzar parse error (no es fixture PDF, es ruido).
- `tiny.png` (10×10 px, ~100 B), `tiny.jpg`, `tiny.webp` — para imagesToPdf.

**Cómo generar las fixtures:** un script `packages/core/test-fixtures/generate.mjs` (Node, usa el propio `pdf-lib`/`qrcode`/etc.) que produce todos los binarios desde código, ejecutable on-demand. **Los binarios resultantes se commitean** (no se generan en CI) para garantizar reproducibilidad.

---

## 7. Testing de adapters

### Vale la pena (media/baja prioridad)
- **`extract-pdf-text/extractPdfText.service.ts`** — tiene heurísticas no triviales (`hasProblematicSymbols`, `likelyScanned`, ratio de símbolos sospechosos) que NO viven en el SDK. Test unitario para `buildExtractResult` (función pura interna): dado un `pages` array y un file mock, validar el output completo.
- **`pdf-to-images/pdfToImages.service.ts`** — `parsePageRange` tiene formato propio (`duplicatesRemoved` en vez de `isOutOfOrder`). Test unitario: rango válido, vacío, fuera de límite, duplicado, formato inválido.
- **`split-pdf/splitPdf.service.ts`** — `cleanOutputBaseName` con la regex ` -`, `validateParts` (la única función que queda en `shared/utils/pageRanges` y no está en el SDK). Worth testing.

### NO necesitan tests específicos (cubiertos por el SDK)
- **`merge-pdf`, `reorder-pdf`, `pdf-page-counter`, `text-cleaner`, `qr-generator`** — son thin re-exports + orquestación trivial. Si el SDK funciona y el build compila, funcionan.
- **`compress-pdf`** — no migrado, sin cambios, fuera del scope del SDK.
- **`image-to-pdf`** — la lógica WebP→canvas es DOM-dependent; cubrirla con tests requiere `happy-dom` y un canvas mock real, esfuerzo desproporcionado al riesgo. Cubrir solo con manual QA.

---

## 8. Estrategia de fixtures

**Principio:** todas las fixtures binarias se **generan deterministamente desde código** y se **commitean al repo**. Nada se descarga en runtime, nada se construye en CI.

### Ubicación
```
packages/core/test-fixtures/
  generate.mjs              ← script Node, on-demand
  pdf/
    text-simple-1p.pdf
    text-multi-3p.pdf
    text-multi-5p.pdf
    scanned-1p.pdf
    encrypted-readable.pdf
    garbage.bin
  images/
    tiny.png
    tiny.jpg
    tiny.webp
  README.md                 ← explica cómo regenerar
```

### Tamaños objetivo
- PDFs de texto: ≤ 5 KB cada uno.
- PDF escaneado: ≤ 30 KB.
- Imágenes: ≤ 200 B cada una.
- **Total fixtures: < 100 KB** — aceptable para el repo, no infla `git clone`.

### Reproducibilidad
- El script `generate.mjs` queda en el repo y puede correrse cuando cambien las deps. Determinista (sin timestamps en metadata cuando sea posible).
- Si pdf-lib actualiza y rompe una fixture, el script la regenera; los tests detectan la regresión.

---

## 9. Herramienta recomendada

**Recomendación: Vitest.**

| Criterio | Vitest | Jest | Node `--test` | Mocha+Chai |
|---|---|---|---|---|
| Alineación con Vite del proyecto | ✅ nativo | ⚠️ config manual | ⚠️ DIY | ⚠️ DIY |
| Soporte ESM out-of-the-box | ✅ | ⚠️ presets necesarios | ✅ | ⚠️ |
| Lee `tsconfig` actual sin friction | ✅ | ⚠️ | ⚠️ | ⚠️ |
| Browser tests (canvas/worker) | ✅ `@vitest/browser` | ❌ jsdom no soporta workers reales | ❌ | ❌ |
| DOM mock para tests "ligeros DOM" | ✅ `happy-dom` o `jsdom` | ✅ jsdom | ❌ | ✅ con jsdom |
| Cobertura built-in | ✅ via `v8`/`istanbul` | ✅ | ❌ | ⚠️ via nyc |
| Speed | ⚡⚡⚡ | ⚡ | ⚡⚡⚡ | ⚡⚡ |
| Mantenido activamente | ✅ | ✅ | ✅ | ⚠️ |

**Deps necesarias (cuando se implemente):**
- `vitest` (devDep)
- `happy-dom` (devDep) — para tests del SDK que tocan APIs livianas de browser (Blob, URL.createObjectURL para fixtures de imágenes).
- `@vitest/browser` + `playwright` (devDep, opcional) — solo si decidimos correr `pdf-render` (worker + canvas) en un browser real automatizado. **Alternativa**: dejar esos tests como manual QA + un test mínimo en Node con un worker polyfill, y aceptar que canvas real solo se valida manualmente.

**Decisión inicial recomendada para Fase 1:** solo `vitest` + `happy-dom`. `@vitest/browser` queda como evaluación para Fase 2 si la falta de cobertura de `pdf-render` resulta dolorosa.

---

## 10. Cobertura mínima para considerar el SDK estable

Criterios concretos para "listo para reservar scope npm y considerar publicación":

1. **100 % de funciones públicas** del SDK tienen al menos 1 test de happy path.
2. **100 % de `throw new Error(...)`** del SDK explícitamente cubiertos por tests.
3. **Opciones cubiertas**: cada opción no trivial probada con al menos un valor distinto del default (`cleanText` 6 opciones; `pdfToImages` 4 opciones; `generateQrDataUrl` 6 opciones).
4. **Worker guard** del `pdf-render` cubierto (test directo de `ensureWorkerConfigured`).
5. **Fixtures committed** y regenerables vía script.
6. **CI**: tests corren automáticamente en push (GitHub Actions u otro; out of scope de este doc).
7. **Cobertura de líneas**: target ≥ 85 % de líneas del SDK (`packages/core/src/**`). Reportada por Vitest coverage.
8. **Sin tests rotos durante 1 release entero** (subjetivo pero importante).

Mientras estos criterios no se cumplan: el SDK sigue en `0.x` interno, sin publicación pública.

---

## 11. Riesgos

| Riesgo | Mitigación |
|---|---|
| **Fixtures bloat repo** | Tope estricto de tamaño (< 100 KB total); script regenera on-demand. |
| **pdfjs worker en Node** | Aceptar QA manual para `pdf-render` en Fase 1; evaluar `@vitest/browser` en Fase 2 si hace falta. |
| **Drift fixtures vs deps** | Script de regeneración committed; tests detectan rotura cuando se actualiza una peer dep. |
| **Falsa seguridad por cobertura alta** | Combinar tests + manual QA + revisión de código; cobertura es métrica, no garantía. |
| **Tests lentos desaniman** | Vitest con run-in-band corre los unit en < 1 s; mantener integration tests bajo 5 s totales. |
| **Tests que dependen de tiempos** (timeouts, races con worker) | Evitar `setTimeout` en tests; usar `vi.useFakeTimers()` o esperar promesas explícitas. |
| **Tests acoplados a versiones específicas** de pdf-lib/pdfjs | Tolerancia en aserciones (ej. `expect(bytes.length).toBeGreaterThan(100)` en vez de igualdad exacta). |
| **Costo de mantenimiento** | Empezar por lo de menor superficie (text, ranges, files) y crecer; no buscar 100 % desde el día 1. |

---

## 12. Roadmap

### Fase 1 — Cobertura del SDK puro (Vitest + happy-dom)
- Setup: `vitest`, `happy-dom`, `tsconfig` de test, npm script `test`.
- Tests **text** (8–12 tests).
- Tests **ranges** (8 tests).
- Tests **files** (6 tests).
- Tests **qr** salvo `generateQrDataUrl` (10 tests).
- Tests **adapter helpers** prioritarios: `parsePageRange` (pdf-to-images), `cleanOutputBaseName` (split), `validateParts` (shared).
- Salida: ~50 tests, < 2 s totales en local. Cobertura > 85 % de los subpaths sin pdf-lib/pdfjs.

### Fase 2 — Cobertura PDF con pdf-lib (Vitest + happy-dom + fixtures)
- Script de fixtures (`test-fixtures/generate.mjs`).
- Fixtures commiteadas (binarios pequeños).
- Tests `countPdfPages`, `mergePdfs`, `splitPdfRange`/`extractPdfPages`, `reorderPdfPages`, `imagesToPdf`.
- Tests `generateQrDataUrl` (validar prefix `data:image/png`).
- Tests `buildExtractResult` (helper del adapter de extract-text).
- Salida: ~25 tests adicionales, < 5 s totales. Cobertura > 85 % de `/pdf` y helpers.

### Fase 3 — Cobertura pdfjs-dist (decisión: browser tests sí/no)
- **Opción A**: `@vitest/browser` + playwright → tests reales de `extractPdfText` y `pdfToImages` con worker y canvas.
- **Opción B**: dejar `pdf-render` con cobertura via QA manual + 1 test unitario del guard (`ensureWorkerConfigured`).
- Esta decisión se toma al cerrar Fase 2, según cuánto fricción real haya tenido el QA manual.

### Fase 4 — CI + cobertura reportada
- GitHub Actions (u otro) corre `npm run test` y `npm run typecheck` por push.
- Coverage gate ≥ 85 % en SDK.
- Esta fase **es la puerta a npm publish**.

---

## 13. Recomendación final

**Implementar tests inmediatamente, en este orden estricto:**

1. **Fase 1 ahora** (SDK puro). Es la de mayor relación cobertura/esfuerzo: protege ~60 % del SDK con menos de un día de trabajo y agrega solo 2 devDeps.
2. **Fase 2 a continuación**. Requiere fixtures pero el patrón ya estará validado.
3. **Pausar** y evaluar: ¿hace falta Fase 3 ya? Si el QA manual de las 2 herramientas pdfjs sigue siendo confiable, posponer.
4. **Fase 4** (CI) antes de cualquier consideración de npm publish.

**NO preparar npm todavía** — sin tests automatizados, publicar es comprometer semver sin red de seguridad. La opinión es firme: tests primero, npm después.

**NO abrir V3.2 todavía** — V3.2 implica nueva superficie (canvas factory público para Node? Pages Function para eventos? Otra tool?). Sumar superficie antes de proteger la existente acumula deuda. Cerrar el testing antes de abrir alcance.

**Resumen de orden recomendado:**

```
Fase 1 (SDK puro)  →  Fase 2 (PDF + fixtures)  →  evaluar Fase 3
                                                       │
                                                       ▼
                                                   Fase 4 (CI)
                                                       │
                                                       ▼
                                          decisión: reservar scope npm
                                                       │
                                                       ▼
                                         decisión: abrir V3.2 o publicar 1.0
```

---

*Fin del documento. No se modificó código. La implementación arranca cuando este plan esté aprobado.*
