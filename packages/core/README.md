# @modulaq/core

Librería interna de Modulaq con la lógica reutilizable de las microherramientas
del sitio. Separa la lógica pura (PDF, texto, QR, helpers) de la UI React.

> **Estado: V0.x interno.** El paquete vive dentro del repositorio
> ([`packages/core`](.)) y se consume desde la app vía workspace local. No está
> publicado en npm. La API es estable para los consumidores internos pero puede
> cambiar entre versiones menores sin previo aviso mientras siga en `0.x`.

---

## Estructura

```
@modulaq/core              Re-exports curados de todos los subpath
@modulaq/core/text         Limpieza y estadísticas de texto
@modulaq/core/qr           Generación y validación de códigos QR
@modulaq/core/pdf          Operaciones con PDFs (pdf-lib)
@modulaq/core/files        Helpers de nombres de archivo
@modulaq/core/ranges       Parseo de selecciones de páginas tipo "1,3,5-7"
```

Importá siempre por subpath para mejor *tree-shaking*:

```ts
import { cleanText } from "@modulaq/core/text";
import { mergePdfs } from "@modulaq/core/pdf";
```

---

## Dependencias requeridas (peer)

| Subpath | Peer dependency | Para qué |
|---|---|---|
| `/pdf` | `pdf-lib ^1.17` | Cargar, manipular y generar PDFs |
| `/qr`  | `qrcode  ^1.5`  | Generar PNGs de códigos QR |
| `/text`, `/files`, `/ranges` | — | sin dependencias |

Las dependencias están declaradas como `peerDependencies` para evitar
duplicarlas en el bundle final del consumidor.

---

## Ejemplos básicos

### Texto

```ts
import { cleanText, getTextStats, defaultTextCleanOptions } from "@modulaq/core/text";

const cleaned = cleanText("  Hola   mundo  \n\n\n", defaultTextCleanOptions);
// "Hola mundo"

const stats = getTextStats(cleaned);
// { characters: 10, words: 2, lines: 1 }
```

### QR

```ts
import { buildQrValue, generateQrDataUrl } from "@modulaq/core/qr";

const value = buildQrValue("email", "hola@modulaq.dev");
// "mailto:hola@modulaq.dev"

const dataUrl = await generateQrDataUrl(value, { size: 512 });
// "data:image/png;base64,..."
```

### PDF

```ts
import {
  countPdfPages,
  mergePdfs,
  splitPdfRange,
  reorderPdfPages,
  imagesToPdf,
} from "@modulaq/core/pdf";

const pageCount   = await countPdfPages(file);
const mergedBytes = await mergePdfs([fileA, fileB]);
const rangeBytes  = await splitPdfRange(file, { from: 2, to: 5 });
const reordered   = await reorderPdfPages(file, [3, 1, 2]);
const pdfFromImgs = await imagesToPdf([pngFile, jpgFile]);
```

Las funciones devuelven `Uint8Array`. Para descargar en el navegador:

```ts
const blob = new Blob([mergedBytes], { type: "application/pdf" });
const url  = URL.createObjectURL(blob);
// ... usar url como href de un <a download="...">
URL.revokeObjectURL(url);
```

### Helpers

```ts
import { sanitizeFileName, ensureFileExtension } from "@modulaq/core/files";
import { parsePageSelection } from "@modulaq/core/ranges";

ensureFileExtension("mi reporte", "pdf", "documento");
// "mi reporte.pdf"

parsePageSelection("1,3,5-7", 10);
// { error: null, isOutOfOrder: false, pages: [1, 3, 5, 6, 7] }
```

---

## Browser-first

V3.0 está pensado para correr en **navegadores modernos** (ESM nativo).

- Las funciones aceptan `File | Blob | ArrayBuffer | Uint8Array` cuando reciben
  bytes, así que muchas son técnicamente isomórficas, pero el target
  oficialmente soportado es navegador.
- `imagesToPdf` admite PNG/JPG directamente. Para WebP el consumidor debe
  convertirlo a PNG (típicamente con un `<canvas>`) y pasarlo como
  `{ bytes, format: "png" }`.

Node, OCR, `<canvas>` y workers quedan fuera del alcance de V3.0.

---

## Relación con modulaq.dev

La app pública en [modulaq.dev](https://modulaq.dev) consume este paquete a
través del workspace local: los `*.service.ts` de cada herramienta son
adaptadores delgados sobre `@modulaq/core/*`. Esto significa que:

- El comportamiento del sitio es la **especificación viva** del SDK.
- Los cambios en el SDK se validan inmediatamente en la app (*dogfooding*).
- Las firmas históricas que la UI espera quedan en los adaptadores; el SDK
  expone API limpia basada en bytes.

---

## Limitaciones actuales (V3.0)

- **Solo navegador** soportado oficialmente.
- **Sin OCR**: el SDK no incluye extracción de texto de PDFs escaneados.
- **Sin renderizado con `pdfjs-dist`**: extraer texto y convertir PDF→imágenes
  no están en V3.0 (planeados para V3.1).
- **Sin compresión real de PDF**: no se expone equivalente a "comprimir PDF";
  decisión deliberada para no inducir falsas expectativas.
- **Salidas múltiples ZIP**: no están en el core; el consumidor compone con
  `jszip` si las necesita (la app de Modulaq lo hace en su adaptador de
  *Dividir PDF*).
- **Sin tests automatizados** en V3.0 alpha; cobertura pendiente.

---

## Roadmap resumido

- **V3.0 (actual, *alpha* interno)** — `text`, `qr`, `pdf` (pdf-lib),
  `files`, `ranges`. Browser-first. Workspace local, sin npm público.
- **V3.1** — `pdf-render` basado en `pdfjs-dist` con configuración de worker
  documentada; extracción de texto sin layout; PDF→imágenes a canvas.
- **V3.2+** — Posible publicación pública en npm, README ampliado,
  tests automatizados y compromiso de *semver*.

Decisiones de plataforma (API real, backend, paquete público) están
documentadas en [`docs/V3_VISION.md`](../../docs/V3_VISION.md) y
[`docs/V3_SDK_AUDIT.md`](../../docs/V3_SDK_AUDIT.md).
