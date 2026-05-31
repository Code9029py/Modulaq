# Modulaq V3.1 — Plan de la Ola 2 del SDK (pdfjs-dist)

> Documento de **planificación**, no de implementación.
> No crea código, no modifica `packages/core`, no toca herramientas, SSG ni
> dependencias.
> Continúa [V3_VISION.md](./V3_VISION.md), [V3_SDK_AUDIT.md](./V3_SDK_AUDIT.md) y
> [V3_SDK_TECHNICAL_DESIGN.md](./V3_SDK_TECHNICAL_DESIGN.md).
> Estado base: Ola 1 del SDK cerrada y commiteada (V3.0α).

---

## 1. Resumen ejecutivo

**Qué busca resolver V3.1.** Trasladar al SDK las dos herramientas que dependen
de `pdfjs-dist` y por eso quedaron afuera de la Ola 1: **`extractPdfText`** y
**`pdfToImages`**. Ambas operan sobre PDFs como las funciones ya migradas en
V3.0, pero introducen tres complicaciones nuevas que no existían en pdf-lib:
un **web worker**, una librería pesada (`pdfjs-dist`) y, en el caso de
imágenes, una **dependencia hard de `<canvas>`**.

**Diferencia respecto a V3.0.** V3.0 fue casi "trasladar lógica pura" — pdf-lib
es isomórfica, sin worker, sin DOM. V3.1 es **el primer paso del SDK con
APIs del navegador y configuración de runtime** (el worker debe estar bien
apuntado). Decisiones que en V3.0 se podían posponer ahora son contractuales.

**Por qué requiere planificación específica.** Hay decisiones que afectan la
DX del SDK durante años y que conviene cerrar antes de tocar código:
quién configura el worker, cómo se evita el *mismatch* de versiones, si el
SDK crea su propio `<canvas>` o lo recibe del consumidor, y cómo se documenta
todo eso sin obligar al consumidor a leer pdf.js.

---

## 2. Estado heredado de V3.0

**Módulos en `@modulaq/core` (Ola 1 cerrada):**
- `@modulaq/core/text` — `cleanText`, `getTextStats`, tipos.
- `@modulaq/core/qr` — `buildQrValue`, `validateQrInput`, `resolveQrOutputSize`,
  `generateQrDataUrl`, constantes y tipos.
- `@modulaq/core/pdf` — `countPdfPages`, `mergePdfs`, `reorderPdfPages`,
  `extractPdfPages`, `splitPdfRange`, `imagesToPdf` (PNG/JPG), `PdfInput`,
  `PageRange`, `ImageInput`.
- `@modulaq/core/files` — `sanitizeFileName`, `ensureFileExtension`,
  `getBaseFileName`, `DownloadExtension`.
- `@modulaq/core/ranges` — `parsePageSelection`, `PageSelectionResult`.

**Herramientas que ya consumen el SDK** (vía adaptadores delgados en sus
`*.service.ts`): Limpiador de texto, Generador de QR, Contador de páginas PDF,
Unir PDFs, Reordenar páginas PDF, Dividir PDF, Imagen a PDF.

**Lo que quedó fuera de la Ola 1**, por orden:
1. **`extractPdfText`** — pdfjs-dist + worker; el service real reconstruye
   layout (~200 líneas).
2. **`pdfToImages`** — pdfjs-dist + worker + `<canvas>` + ZIP (multipágina).
3. **`compressPdf`** — **excluido permanentemente** del SDK por decisión de V2
   (no recomprime imágenes, publicar el snippet induciría a error).
4. **`validateParts`** — quedó solo en `shared/utils/pageRanges.ts`; no hay
   consumidor externo del SDK que la necesite hoy.
5. **`formatFileSize`, `isPdfFile`, `toArrayBuffer`** — quedaron en
   `shared/utils/file.ts`; son utilidades de UI/limites, no del dominio del
   SDK; sin plan de migración.

---

## 3. Alcance propuesto para V3.1

### Incluido
- **`extractPdfText`** — extracción de texto seleccionable por página y unido.
  Versión simple (sin reconstrucción de layout). La heurística de "PDF
  probablemente escaneado" y las advertencias UX quedan en el adapter.
- **`pdfToImages`** — render de páginas a PNG (default) o JPEG. Una página por
  llamada o múltiples páginas. El empaquetado ZIP queda en el adapter (igual
  que en V3.0 con `splitPdfIntoIndividualPages`).
- **Configuración del worker de pdfjs-dist** como API pública del SDK
  (`configurePdfWorker(...)`).

### Excluido explícitamente
- `compressPdf` (excluido permanente).
- **OCR** y reconocimiento de imágenes — fuera del scope; sigue requiriendo
  backend o librerías pesadas (Tesseract).
- **Backend, API real, login, monetización, npm publish, IA, procesamiento
  server-side** — todos siguen fuera por las invariantes del proyecto
  (procesamiento local, costo 0, privacidad).
- **Reconstrucción de layout** completa en `extractPdfText` — queda en el
  adapter de la app por ahora; el SDK ofrece la versión simple. La heurística
  de detección de PDFs escaneados sigue en el adapter.
- **Modificación de los servicios ya migrados** (text, qr, pdf-lib). V3.1
  agrega; no toca lo cerrado.

---

## 4. Evaluación técnica de `extractPdfText`

| Dimensión | Detalle |
|---|---|
| Dependencia | `pdfjs-dist ^5.6` (ya peer-elegida) |
| Worker | **Requerido**. `pdfjs-dist` parsea PDFs en un Web Worker para no bloquear el main thread |
| Compatibilidad | **Browser-first**. Funciona en Node con `--experimental-vm-modules` y polyfills, pero V3.1 lo declara browser-only oficialmente |
| Bundle | `pdfjs-dist` es **el peer más pesado** del SDK (~1 MB gzipped incluyendo el worker). Sigue siendo `peerDependency`, el consumidor controla la versión y el bundling |
| Firma tentativa | `extractPdfText(input: PdfInput): Promise<{ pages: string[]; text: string }>` — devuelve texto por página y la unión con doble salto entre páginas. Sin opciones en V3.1 |
| Errores esperables | PDF dañado/protegido → `Error`; worker no configurado → `Error("Configurá el worker de pdfjs antes de llamar")`; PDFs escaneados devuelven páginas vacías (no es error, es ausencia de texto seleccionable) |
| Lo que NO hace | OCR, reconstrucción de columnas, detección de tablas, sanitización de caracteres extraños — el adapter en la app lo hace si lo necesita |

**Comportamiento simple definido:**
- Para cada página, junta `item.str` de `getTextContent()` con espacios,
  normaliza espacios múltiples y separa páginas con `"\n\n"`.
- El orden de lectura es **aproximado** (sin layout). Lo declaramos
  explícitamente en el README del SDK.

---

## 5. Evaluación técnica de `pdfToImages`

| Dimensión | Detalle |
|---|---|
| Renderizado | `page.render({ canvas, canvasContext, viewport })` de pdfjs |
| Canvas | **Requerido**. Necesario para que pdfjs pinte la página antes de exportarla a imagen |
| Formato | PNG (default vía `canvas.toBlob("image/png")`). JPEG con calidad configurable |
| Memoria | Una página A4 a `scale=2` ≈ 4–8 MB de canvas. Páginas grandes o muchas en paralelo pueden tirar la pestaña. **El SDK procesa secuencialmente** para acotar la memoria |
| Multipágina | Loop interno de pdfjs; el consumidor recibe `Uint8Array[]` (una por página) o data URLs. El **empaquetado ZIP queda en el adapter** (consistente con Ola 1; mantiene `jszip` fuera del core) |
| Worker | Mismo worker compartido que `extractPdfText`. Una sola configuración para los dos |

### Decisión: A. Canvas interno del SDK · B. Canvas/factory provisto por el consumidor

| Aspecto | A. SDK crea `<canvas>` | B. Consumidor provee canvas o factory |
|---|---|---|
| DX típica | Muy simple — `pdfToImages(file)` y listo | Más boilerplate — hay que crear/pasar canvas |
| Portabilidad | Atado a `document.createElement("canvas")` (DOM) | Funciona en Node con `node-canvas`, Workers, OffscreenCanvas |
| Memoria | El SDK puede reusar un mismo canvas entre páginas (optimización) | El consumidor decide |
| Acoplamiento | El SDK toca el DOM directamente | El SDK no toca el DOM |
| Riesgo de "API encerrada en navegador" | Alto — difícil de revertir sin breaking | Bajo |

**Recomendación: A con escape hatch — `createCanvas?: () => HTMLCanvasElement` opcional.**

- Comportamiento por defecto (A): el SDK llama `document.createElement("canvas")` internamente.
- *Opt-in* (B-like): si el consumidor pasa `{ createCanvas: () => myCanvas }`,
  el SDK lo usa en lugar del default.

Esto cubre el 95% de casos (Modulaq Web) sin escribir más código, y deja
abierta la puerta a Node/OffscreenCanvas/SSR sin un breaking change futuro.
El SDK toca DOM **solo si** el `createCanvas` opcional no se pasó. Si en V3.2
queremos vivir en Node, hacemos `createCanvas` obligatorio en una nueva
overload, no rompemos la API actual.

---

## 6. Estrategia de worker

**Decisión: el consumidor configura el worker explícitamente vía un helper público del SDK.**

```ts
// API tentativa
configurePdfWorker(workerSrc: string | URL): void;
configurePdfWorker(options: { workerPort: Worker }): void;
```

**Quién configura.** El consumidor (Modulaq Web en nuestro caso). Una sola
vez por aplicación, al cargar. Las funciones del SDK que necesitan worker
(`extractPdfText`, `pdfToImages`) lanzan `Error` si se llaman antes de
configurar.

**Dónde vive la configuración.** En el SDK como API pública en
`@modulaq/core/pdf-render` (subpath nuevo) o `@modulaq/core/pdf` (re-export).
Internamente: setea `pdfjsLib.GlobalWorkerOptions.workerSrc` o `workerPort`.

**Cómo evitar mismatch de versiones.** Tres mecanismos combinados:
1. El SDK declara `peerDependency: pdfjs-dist ^X.Y`. Si el consumidor instala
   otra major, npm avisa.
2. Documentación obligatoria: "El archivo `pdf.worker.min.mjs` que pases tiene
   que ser de la **misma versión exacta** de pdfjs-dist instalada." Esta línea
   irá literalmente en el README del SDK.
3. El SDK NO publica un workerSrc por default (no hardcodea ninguna URL CDN).
   Mejor un error claro que un silencioso mismatch con cache.

**Cómo se documenta.** Una sección "Configurar el worker" en
`packages/core/README.md` con los tres patrones (Vite `?url`, CDN versionada,
`new Worker(new URL(...))`), idéntica a la que ya se usó en los snippets de
V2.3C.

---

## 7. Diseño tentativo del SDK V3.1

### Estructura nueva en `packages/core/src/`

```
pdf-render/                  ← subpath nuevo; aísla todo lo que depende de pdfjs-dist
  configurePdfWorker.ts
  extractPdfText.ts
  pdfToImages.ts
  shared.ts                  ← loadPdfJsDocument(input) + guard de worker
  types.ts
  index.ts
```

Razón de **un subpath nuevo `pdf-render`** en lugar de mezclarlo en `pdf/`: las
funciones de pdf-lib (`countPdfPages`, `mergePdfs`, ...) no necesitan worker
ni canvas. Mantenerlas en `pdf/` permite que consumidores ligeros importen
solo de ahí y **no paguen el bundle de `pdfjs-dist`**. El subpath separado lo
hace explícito y mejora el tree-shaking.

### Firmas tentativas

```ts
// @modulaq/core/pdf-render

import type { PdfInput } from "@modulaq/core/pdf";

/** Configura el worker de pdfjs-dist. Llamar una vez antes de usar el resto. */
export function configurePdfWorker(workerSrc: string | URL): void;
export function configurePdfWorker(options: { workerPort: Worker }): void;

/** Extracción simple de texto seleccionable: texto por página + unión. */
export function extractPdfText(input: PdfInput): Promise<{
  pages: string[];
  text: string;
}>;

/** Render por página. Devuelve PNG/JPEG como Uint8Array por cada página. */
export type PdfToImagesOptions = {
  /** 1-based; default: todas las páginas */
  pages?: number[];
  /** Default: 2 */
  scale?: number;
  /** Default: "png" */
  format?: "png" | "jpeg";
  /** Solo aplica si format="jpeg". Default: 0.92 */
  quality?: number;
  /** Escape hatch para Node/OffscreenCanvas. Default: document.createElement("canvas") */
  createCanvas?: () => HTMLCanvasElement;
};

export type PdfPageImage = {
  pageNumber: number;
  bytes: Uint8Array;
  width: number;
  height: number;
};

export function pdfToImages(
  input: PdfInput,
  options?: PdfToImagesOptions,
): Promise<PdfPageImage[]>;
```

Nada de esto se implementa en este documento. Se ratifica o ajusta antes de
escribir código en la próxima fase.

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| **Worker mismatch** entre versión de `pdfjs-dist` instalada y archivo `pdf.worker.min.mjs` apuntado | No hardcodear ningún workerSrc por default; consumidor lo configura; README lo declara obligatorio |
| **Canvas atando el SDK al DOM** | Default usa `document.createElement`, pero `createCanvas` opcional permite escape sin breaking |
| **Memoria** con páginas grandes / scale alto | Proceso secuencial; documentar que `scale > 3` puede tirar pestañas en PDFs A2/A3 |
| **Bundle size** por `pdfjs-dist` | Aislado en subpath `/pdf-render`; los consumidores de `/pdf` solo no pagan nada |
| **Compatibilidad ESM/CJS** del worker mjs | `pdfjs-dist` v5 es ESM-only; sumarse al `type: "module"` ya establecido |
| **Mantenimiento** ante cambios de API de pdfjs | Adapter delgado en el SDK; cambios futuros se contienen en una sola capa |
| **Texto sin layout** = orden de lectura aproximado | Limitación documentada en README; layout reconstruction queda en adapter o V3.2 |
| **Errores por worker no configurado** | El SDK lanza error claro con el nombre del helper a llamar |

---

## 9. Criterios de éxito

V3.1 se considera terminada cuando:

1. `@modulaq/core/pdf-render` expone `configurePdfWorker`, `extractPdfText` y
   `pdfToImages` con las firmas finales.
2. `extractPdfText` (SDK) cubre los casos del adapter actual sin layout:
   texto por página + unión.
3. `pdfToImages` (SDK) devuelve un PNG/JPEG por cada página solicitada.
4. La herramienta **Extraer texto de PDF** consume el SDK; la heurística de
   "PDF escaneado" y la lógica opcional de layout permanecen en el adapter.
5. La herramienta **PDF a imágenes** consume el SDK; el empaquetado ZIP
   (multipágina) sigue en el adapter usando `jszip`.
6. `npm run build` queda verde en todas las fases de la migración.
7. Comportamiento UX **idéntico** en ambas herramientas (validación manual).
8. README de `@modulaq/core` actualizado con sección "Configurar el worker".
9. Ningún consumidor de `@modulaq/core/pdf` (las funciones de pdf-lib)
   carga `pdfjs-dist` por accidente — verificable revisando los chunks del
   build.
10. Sin nuevas dependencias en el repo y sin tocar SSG/SEO/analytics.

---

## 10. Próximo paso recomendado

**Implementar primero `extractPdfText`.**

Razones, en orden:
1. **Sin canvas.** Sirve para resolver la pieza más espinosa del scope (worker)
   sin sumar al mismo tiempo el tema del canvas. Si rompemos algo, sabemos que
   es del worker.
2. **Devuelve `string`.** Resultado fácil de inspeccionar, comparar y testear
   manualmente.
3. **Habilita el helper `configurePdfWorker`** y la estructura `/pdf-render` —
   piezas que después reutiliza `pdfToImages` sin redescubrir el patrón.
4. **Riesgo más bajo:** la herramienta de Extraer texto tiene un superset
   de la lógica (layout reconstruction) que queda en el adapter, así que la
   migración es estrictamente "swap del extractor simple"; el comportamiento
   visible no cambia.

Tras dejar `extractPdfText` verde y verificado, **segunda ola dentro de V3.1**:
`pdfToImages` con `createCanvas` opcional y default DOM.

Última puntada: **README ampliado del SDK** con sección de worker y
descripción de `/pdf-render`, antes de cerrar V3.1.

---

*Fin del plan. No se modificó código. La fase de implementación arranca cuando
este documento esté aprobado.*
