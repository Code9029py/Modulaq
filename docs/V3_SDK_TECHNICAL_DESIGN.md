# Modulaq V3 — Diseño técnico del SDK (V3.0)

> Documento de **diseño técnico**, no de implementación.
> No crea el paquete, no agrega dependencias, no toca herramientas, SSG ni versión.
> Continúa [V3_VISION.md](./V3_VISION.md) y [V3_SDK_AUDIT.md](./V3_SDK_AUDIT.md).

---

## 1. Resumen ejecutivo

**Qué define este documento.** Cómo se va a construir el paquete `@modulaq/core` para V3.0: estructura, exports, firmas, tipos, dependencias, build, migración y dogfooding.

**Diferencia entre auditoría y diseño técnico.**
- La **auditoría** (V3_SDK_AUDIT) decidió *qué* extraer y en qué orden, evaluando portabilidad y riesgo por función.
- Este **diseño técnico** decide *cómo* embalarlo: nombres exactos, firmas, manejo de errores, build, plan de migración.

**Confirmación.** V3.0 = **SDK-first**, **local/privado**, **browser-first**. Sin npm público, sin Node/isomórfico, sin backend/API/login/monetización, sin `pdfjs-dist`, sin `compressPdf`, sin V2.5B.

---

## 2. Objetivos técnicos de V3.0 SDK

1. **Extraer lógica reutilizable** de los `*.service.ts` actuales a funciones puras y tipadas.
2. **Separar lógica pura de UI React**: el SDK no sabe que existe `<MergePdfTool />`.
3. **Reducir drift entre app y SDK**: una sola fuente de verdad, validada por dogfooding.
4. **Permitir que Modulaq Web consuma el SDK** durante V3.0 vía workspace local.
5. **Mantener procesamiento local y privacy-first**: el SDK corre en el entorno del consumidor, nunca toca un server de Modulaq.

---

## 3. Alcance cerrado de V3.0

### Incluido
- **text** — `cleanText`, `getTextStats`.
- **qr** — `buildQrValue`, `validateQrInput`, `resolveQrOutputSize`, `generateQrDataUrl`.
- **pdf** (con `pdf-lib`) — `countPdfPages`, `mergePdfs`, `splitPdfRange`, `reorderPdfPages`, `imagesToPdf` (PNG/JPG sin DOM).
- **files** — `formatFileSize`, `toArrayBuffer`, `getBaseFileName`, `sanitizeFileName`, `ensureFileExtension`.
- **ranges** — `parsePageSelection`, `validateParts`.

### Excluido (explícito)
- API real / backend / procesamiento server-side.
- Login, cuentas, pagos.
- Publicación pública en npm en esta etapa.
- `pdfjs-dist` y todo lo que lo requiera (`extractPdfText`, `pdfToImages`) → V3.1.
- `compressPdf` (coherente con V2; no recomprime imágenes y publicarlo induciría a error).
- WebP en `imagesToPdf` (requiere `<canvas>`) → V3.1 o helper aparte.
- Nuevas herramientas no relacionadas.
- `jszip` y salidas múltiples ZIP fuera del core inicial.

---

## 4. Estructura tentativa

```
packages/
  core/
    package.json            // "@modulaq/core", "private": true, type: "module"
    tsconfig.json           // composite, "module": "NodeNext", target moderno
    README.md
    src/
      index.ts              // re-export curado de los subpath
      text/
        index.ts            // re-export
        cleanText.ts
        getTextStats.ts
        types.ts
      qr/
        index.ts
        buildQrValue.ts
        validateQrInput.ts
        resolveQrOutputSize.ts
        generateQrDataUrl.ts
        types.ts
      pdf/
        index.ts
        countPdfPages.ts
        mergePdfs.ts
        splitPdfRange.ts
        reorderPdfPages.ts
        imagesToPdf.ts
        types.ts
      files/
        index.ts
        formatFileSize.ts
        toArrayBuffer.ts
        names.ts            // sanitizeFileName, ensureFileExtension, getBaseFileName
        types.ts
      ranges/
        index.ts
        parsePageSelection.ts
        validateParts.ts
        types.ts
      shared/
        normalizeBytes.ts   // helper interno: File|ArrayBuffer|Uint8Array → Uint8Array
        errors.ts           // ModulaqError + códigos
```

**Por qué un solo `packages/core` y no varios paquetes desde el inicio.**
- **Menor superficie de versionado:** un solo `version`, un solo CHANGELOG, una sola decisión de "cuándo cortar".
- **Migración más simple desde la app:** un único `@modulaq/core` reemplaza N `service.ts`.
- **Tree-shaking sigue funcionando** con ESM + subpath exports; el consumidor solo paga por lo que importa.
- **Riesgo de monorepo prematuro:** dividir en `@modulaq/text`, `@modulaq/pdf`, etc. multiplica la infraestructura (publishing, semver coordinado, peer matrices) sin beneficio mientras todo se mantiene junto.
- Si V3.x demuestra que un subdominio merece su propio paquete, se extrae *después*. La división temprana es la trampa cara.

---

## 5. Subpath exports tentativos

En `packages/core/package.json`:

```jsonc
{
  "name": "@modulaq/core",
  "type": "module",
  "exports": {
    ".":        { "import": "./dist/index.js",          "types": "./dist/index.d.ts" },
    "./text":   { "import": "./dist/text/index.js",     "types": "./dist/text/index.d.ts" },
    "./qr":     { "import": "./dist/qr/index.js",       "types": "./dist/qr/index.d.ts" },
    "./pdf":    { "import": "./dist/pdf/index.js",      "types": "./dist/pdf/index.d.ts" },
    "./files":  { "import": "./dist/files/index.js",    "types": "./dist/files/index.d.ts" },
    "./ranges": { "import": "./dist/ranges/index.js",   "types": "./dist/ranges/index.d.ts" }
  }
}
```

Consumo desde la app (dogfooding) y desde terceros:

```ts
import { cleanText }       from "@modulaq/core/text";
import { mergePdfs }       from "@modulaq/core/pdf";
import { parsePageSelection } from "@modulaq/core/ranges";
// o conveniencia (no recomendado para bundle size):
import { cleanText } from "@modulaq/core";
```

Esta estructura **se valida durante el dogfooding**: si al migrar `mergePdf.service.ts` la importación se siente forzada o pide algo que no está, se ajustan los exports antes de cerrar V3.0.

---

## 6. API pública tentativa

> Firmas tentativas en TypeScript, **sin implementar**. Pensadas para aceptar `ArrayBuffer | Uint8Array | Blob | File` donde tenga sentido, para evitar atarse a una sola superficie del navegador.

### text
```ts
type TextCleanOptions = Partial<{
  removeMultipleSpaces: boolean;
  removeExtraLineBreaks: boolean;
  trimEdges: boolean;
  normalizeQuotes: boolean;
  removeInvisibleCharacters: boolean;
  collapseEmptyLines: boolean;
}>;

type TextStats = { characters: number; words: number; lines: number };

export function cleanText(input: string, options?: TextCleanOptions): string;
export function getTextStats(input: string): TextStats;
```

### qr
```ts
type QrContentType = "text" | "url" | "email" | "phone";
type QrInput = string;

type QrOptions = Partial<{
  size: number;                 // px, default 512
  margin: number;               // default 2
  errorCorrection: "L" | "M" | "Q" | "H"; // default "M"
  dark: string;                 // color, default "#13202b"
  light: string;                // color, default "#f3f7fa"
}>;

type QrValidationResult = { isWarning: boolean; message: string | null };
type QrSize = "small" | "medium" | "large" | "custom";

export function buildQrValue(contentType: QrContentType, input: QrInput): string;
export function validateQrInput(contentType: QrContentType, input: QrInput): QrValidationResult;
export function resolveQrOutputSize(size: QrSize, customSizeInput?: string):
  { error: string | null; pixels: number | null };
export function generateQrDataUrl(input: QrInput, options?: QrOptions): Promise<string>;
```

### pdf (con `pdf-lib`)
```ts
type PdfInput  = File | Blob | ArrayBuffer | Uint8Array;
type ImageInput = File | Blob | ArrayBuffer | Uint8Array;
type PageRange = { from: number; to: number };          // 1-based, inclusivo
type ImagesToPdfOptions = Partial<{
  fit: "image-size" | "a4";                              // default "image-size"
  margin: number;                                        // pt, default 0 (o 36 si fit="a4")
}>;

export function countPdfPages(input: PdfInput): Promise<number>;
export function mergePdfs(inputs: PdfInput[]): Promise<Uint8Array>;
export function splitPdfRange(input: PdfInput, range: PageRange): Promise<Uint8Array>;
export function reorderPdfPages(input: PdfInput, order: number[]): Promise<Uint8Array>;
export function imagesToPdf(inputs: ImageInput[], options?: ImagesToPdfOptions): Promise<Uint8Array>;
```

### ranges
```ts
type PageSelectionResult = {
  error: string | null;
  isOutOfOrder: boolean;
  pages: number[];
};

type PartsValidationResult = {
  assignedPageCount: number;
  error: string | null;
  isValid: boolean;
  missingPages: number[];
  pagesByPart: number[][];
  repeatedPages: number[];
};

export function parsePageSelection(input: string, totalPages: number): PageSelectionResult;
export function validateParts(totalPages: number, parts: string[]): PartsValidationResult;
```

### files
```ts
type DownloadExtension = "pdf" | "png" | "txt" | "zip";

export function sanitizeFileName(name: string, fallback?: string): string;
export function ensureFileExtension(name: string, extension: DownloadExtension, fallback?: string): string;
export function getBaseFileName(fileName: string): string;
export function formatFileSize(bytes: number): string;
export function toArrayBuffer(input: PdfInput | ImageInput): Promise<ArrayBuffer>;
```

**Principios de firma.**
- Aceptar la unión más amplia razonable como entrada; devolver primitivas (`Uint8Array`, `string`, `number`).
- Las opciones siempre por objeto con defaults sensatos.
- Las funciones que generan bytes **no** generan nombres de archivo — el consumidor decide (`files/names.ts` ayuda).
- Mensajes de error en idioma neutro (la app de Modulaq pone los suyos en español).

---

## 7. Tipos públicos

Re-exportados en `index.ts` de cada submódulo:

- `PdfInput`, `ImageInput` — uniones de entradas binarias soportadas.
- `PageRange`, `PageSelectionResult`, `PartsValidationResult`.
- `TextCleanOptions`, `TextStats`.
- `QrContentType`, `QrInput`, `QrOptions`, `QrValidationResult`, `QrSize`.
- `OutputFile` *(opcional)* — `{ bytes: Uint8Array; mimeType: string; extension: DownloadExtension }`, útil cuando el consumidor quiere recibir todo junto.
- `ModulaqError` — clase de error tipada con `code` enumerado:
  ```ts
  type ModulaqErrorCode =
    | "INVALID_INPUT"
    | "UNSUPPORTED_FORMAT"
    | "ENCRYPTED_PDF"
    | "MALFORMED_PDF"
    | "OUT_OF_RANGE"
    | "EMPTY_RESULT";
  class ModulaqError extends Error { readonly code: ModulaqErrorCode; }
  ```

**Cuándo lanzar vs cuándo devolver resultado validado.**
- **Resultado validado** (objeto con `error: string | null`) cuando el "error" es **esperable y parte del flujo** (entrada del usuario que se valida en vivo): `parsePageSelection`, `validateParts`, `validateQrInput`, `resolveQrOutputSize`.
- **`throw` (`ModulaqError`)** cuando es **excepcional** (input malformado, PDF encriptado, formato no soportado): `mergePdfs`, `splitPdfRange`, `reorderPdfPages`, `countPdfPages`, `imagesToPdf`, `generateQrDataUrl`.

Esta separación coincide con cómo los `service.ts` actuales ya manejan los dos casos.

---

## 8. Dependencias y peerDependencies

| Submódulo | Dependencia | Estrategia |
|---|---|---|
| `text` | — | sin deps |
| `files` | — | sin deps |
| `ranges` | — | sin deps |
| `qr` | `qrcode` | **peerDependency** |
| `pdf` | `pdf-lib` | **peerDependency** |
| `pdfjs-dist` | — | **fuera de V3.0** (Ola 2) |
| `jszip` | — | **fuera del core** (si más adelante hay salidas múltiples, sub-export aparte) |

**Recomendación: `peerDependencies` para `pdf-lib` y `qrcode`** desde el inicio (con `peerDependenciesMeta.optional: false`).

**Pros de peer:**
- Evita duplicar `pdf-lib`/`qrcode` en el bundle del consumidor cuando ya las tiene (Modulaq Web ya las tiene → bundle más chico en dogfooding).
- El consumidor controla la versión exacta → menos conflictos.
- Es el patrón estándar de librerías ESM con deps pesadas.

**Contras:**
- Quien instale el paquete a futuro debe instalar también las peers (UX de install ligeramente peor).
- En dev local del workspace hay que asegurarse de tener las peers instaladas (Modulaq Web ya las tiene).

**Decisión inicial:** **peer**, declarando rangos amplios (`pdf-lib ^1.17`, `qrcode ^1.5`) y aclarando en el README qué instalar. Si al publicar npm se observa fricción real, se reevalúa.

---

## 9. Build del paquete

**Estrategia para V3.0:**
- **ESM-first**, sin CommonJS inicial (la app y los consumidores objetivo soportan ESM nativo).
- **Type declarations** (`.d.ts`) generadas con `tsc`.
- **Tree-shaking** garantizado por ESM + subpath exports + no side-effects (`"sideEffects": false` en `package.json`).
- **Preservar subpath exports** (no fusionar todo en un solo bundle).
- **No bundlear dependencias pesadas** (`pdf-lib`, `qrcode`) — quedan como peer, externas al output.

**Herramienta recomendada para V3.0: `tsc` puro** (cero deps nuevas).
- Funciona perfecto para ESM + `.d.ts` cuando se preserva la estructura de carpetas (un `.js` por archivo `.ts`).
- Cumple con todos los objetivos (tree-shaking, subpath exports, sin bundling de peers).
- **No agrega devDependencies** al repo → respeta "sin dependencias nuevas innecesarias".

**Alternativas evaluadas (no se adoptan ahora):**
- **`tsup`** — zero-config ESM+dts, agrega una devDep. Mejor opción si más adelante se quiere bundlear o ofrecer salida única; reevaluar al publicar npm público.
- **`vite` lib mode** — overkill para este alcance; el proyecto ya usa Vite pero la app, no la librería.

**Decisión inicial:** **`tsc` puro** para V3.0; reevaluar `tsup` antes de publicar a npm si hace falta minificar o producir bundles.

**`tsconfig.json` tentativo del paquete:**
```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "lib": ["ES2022", "DOM"]
  },
  "include": ["src/**/*"]
}
```

`"lib": ["ES2022", "DOM"]` reconoce `File`/`Blob`/`Uint8Array` sin obligar a `dom-shim` en consumidores Node (lo dejamos browser-first, no Node-incompatible).

---

## 10. Plan de dogfooding

Fases (cada una termina con `npm run build` verde):

1. **Crear paquete local mínimo** (`packages/core` con `package.json`, `tsconfig`, `src/index.ts` vacío y workspace en `package.json` raíz).
2. **Migrar helpers puros primero** (`files`, `ranges`) — son los más simples y muchos services dependen de ellos.
3. **Migrar `text/cleanText`** (cero deps, ideal para validar la pipeline end-to-end).
4. **Migrar `pdf/countPdfPages`** (la pdf-lib más simple — valida la integración con peer).
5. **Consumir desde la app**: `tools/text/text-cleaner/textCleaner.service.ts` y `tools/pdf/pdf-page-counter/pdfPageCounter.service.ts` reescritos como thin re-exports / adaptadores sobre `@modulaq/core`.
6. **`npm run build`** + **probar manualmente** las herramientas afectadas (Limpiador de texto, Contador de páginas) → si pasa, seguir; si no, corregir el SDK y repetir.
7. **Avanzar con el resto del bloque PDF** (`mergePdfs`, `splitPdfRange`, `reorderPdfPages`, `imagesToPdf`).
8. **Bloque QR** completo (4 funciones).
9. **Cierre de V3.0** con la app consumiendo `@modulaq/core` en todas las herramientas in-scope.

**Criterios de éxito.**
- `npm run build` queda verde tras cada fase.
- Las herramientas migradas se comportan **idénticamente** (mismo output, mismos errores, misma UX).
- No aumenta la complejidad visible (mismo tamaño de bundle por ruta, o menor).
- SSG y rutas indexables intactas.
- **No queda lógica duplicada** entre `service.ts` y `@modulaq/core` al cerrar V3.0.
- Sin regresiones UX (verificación manual por herramienta migrada).

---

## 11. Plan de migración incremental (orden recomendado)

1. **`files` + `ranges` helpers** — base de muchas otras.
2. **`text`** — `cleanText`, `getTextStats`.
3. **`qr`** — 4 funciones, una sola dep (`qrcode`).
4. **`pdf/countPdfPages`** — la más simple del bloque PDF.
5. **`pdf` resto:** `mergePdfs`, `splitPdfRange`, `reorderPdfPages`.
6. **`pdf/imagesToPdf`** (rama PNG/JPG sin DOM).
7. **Preparar V3.1** — auditoría específica de `pdfjs-dist` (worker, `canvas`, target) en un documento aparte; *no* migrar todavía `extractPdfText` ni `pdfToImages`.

Cada paso es independientemente reversible (si rompe, se vuelve al `service.ts` previo y se ajusta el SDK).

---

## 12. Testing mínimo recomendado

> Sin instalar runner todavía. Cuando se elija (Vitest sería el natural por estar ya en el ecosistema Vite), se incluye en un PR aparte.

**Cobertura objetivo (Ola 1):**
- **Unitarios para funciones puras:** `cleanText` (cada opción), `getTextStats`, `parsePageSelection` (válidos / inválidos / fuera de rango), `validateParts` (faltantes / repetidas / vacías), `sanitizeFileName` (caracteres prohibidos, reservados Windows), `ensureFileExtension`.
- **QR:** `validateQrInput` por contentType, `buildQrValue` con email/phone/url, `resolveQrOutputSize` (preset y custom con borde).
- **PDF (con fixtures pequeñas):** `countPdfPages` (1, N páginas, PDF encriptado → `ModulaqError`), `mergePdfs` (orden), `splitPdfRange` (rango válido/inválido), `reorderPdfPages` (orden incompleto → error).
- **Pruebas manuales** de cada herramienta migrada (criterio del plan de dogfooding).

**No es necesario** cobertura exhaustiva en Ola 1; sí, los happy paths + los errores documentados como `ModulaqError`.

---

## 13. Versionado y publicación

- **Privado/local durante V3.0:** `package.json` con `"private": true`, sin publicar.
- **Versión interna inicial:** `0.1.0` (más explícito que `0.0.0`; comunica "primera versión funcional" sin prometer estabilidad).
- **No prometer estabilidad pública** mientras esté en `0.x`: breaking changes permitidos entre minors.
- **Publicar npm solo después de:**
  1. Dogfooding completo (toda la app consume `@modulaq/core`).
  2. README mínimo escrito (sección 14).
  3. Decisión explícita de licencia.
  4. Confirmación de disponibilidad del scope `@modulaq` en npm.
- **Semver real** recién cuando se decida `1.0.0` (API pública estable).

---

## 14. Documentación

**`packages/core/README.md` inicial:**
1. **Qué es** — librería de microherramientas reutilizables extraídas de modulaq.dev.
2. **Estado** — V0.x, browser-first, en validación interna (dogfooding).
3. **Instalación** (cuando aplique): `npm i @modulaq/core pdf-lib qrcode`.
4. **Uso por submódulo** — un ejemplo mínimo por bloque (`text`, `qr`, `pdf`, `files`, `ranges`).
5. **Ejemplos**: copy-paste directos, reusando los snippets que ya viven en el catálogo del sitio (V2.3/B/C).
6. **Límites** — browser-first, peers requeridos, sin OCR, sin "compresión real" de PDF, PDFs encriptados pueden no procesarse.
7. **Privacidad** — la lógica corre en el entorno del consumidor; el SDK no hace red por sí mismo.
8. **Compatibilidad** — navegadores modernos ESM; Node no soportado oficialmente en V3.0.
9. **Relación con modulaq.dev** — el sitio usa este mismo paquete (cuando termine el dogfooding); cambios en el SDK pueden afectarlo.
10. **Licencia / contacto** — pendientes de decisión (ver §16).

---

## 15. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| **Drift app↔SDK** | Dogfooding obligatorio; los `service.ts` quedan como thin re-exports tras la migración. |
| **Sobrearquitectura** | API se diseña iterando contra los casos reales del sitio; sin features hipotéticas. |
| **Bundle size** | ESM + subpath exports + `sideEffects: false` + peers para deps pesadas. |
| **Peer dependency conflicts** | Rangos amplios (`pdf-lib ^1.17`, `qrcode ^1.5`); CI futuro probaría con la versión mínima y la máxima. |
| **APIs del navegador** (`File`, `Blob`) | Firmas aceptan `ArrayBuffer`/`Uint8Array` además; helper interno `normalizeBytes` centraliza la conversión. |
| **Errores mal definidos** | `ModulaqError` con `code` enumerado; mensajes en idioma neutro; tests cubren cada `code`. |
| **Migración rompe herramientas** | Migración paso a paso, build verde y prueba manual entre pasos; rollback simple (volver al `service.ts` anterior). |
| **Expectativas si se publica antes de tiempo** | Privado/local hasta cerrar dogfooding; al publicar, `0.x` + README claro sobre estado. |
| **TypeScript composite** complica el build del repo | Se evalúa si conviene `composite: true` o build independiente; impacto en `tsc -b` del repo. |

---

## 16. Decisiones pendientes (Nelson)

1. **`peerDependencies` vs `dependencies`** para `pdf-lib`/`qrcode` → recomendación: **peer**. Confirmar.
2. **Herramienta de build:** **`tsc` puro** (recomendado, cero deps nuevas) vs `tsup` (más cómodo, una devDep extra).
3. **Incluir `jszip`** en V3.0 (variantes ZIP de split) o postergar → recomendación: **postergar**, sub-export aparte si surge necesidad.
4. **Licencia** — MIT candidata; decidir antes de cualquier publicación.
5. **Cuándo publicar a npm** — después de dogfooding + README + licencia + scope reservado.
6. **Disponibilidad del scope `@modulaq`** en npm — verificar antes de comprometerse con el nombre.
7. **Workspace** en el `package.json` raíz — confirmar uso de `"workspaces": ["packages/*"]` (estándar npm) o equivalente.
8. **Tests en la primera implementación** o en fase posterior — recomendación: **mínimos junto a cada migración** (no demorar la fase de tests hasta el final).

---

## 17. Próximo paso recomendado

Tras aprobar este documento, la **siguiente fase** es la **prueba local mínima**:

- Crear `packages/core` con `package.json` privado, `tsconfig` y `src/index.ts`.
- Configurar `workspaces` en `package.json` raíz.
- Migrar **`files`/`ranges` helpers** + **`text/cleanText`** + **`pdf/countPdfPages`** (los más simples).
- Reescribir los `service.ts` de Limpiador de texto y Contador de páginas como thin re-exports.
- `npm run build` verde + verificación manual de ambas herramientas.

Esa prueba **valida la pipeline completa** (workspace, build, exports, consumo desde la app) con la mínima superficie de riesgo. Si pasa, el resto del plan de migración (§11) es repetir el patrón.

---

*Fin del diseño técnico. No se modificó código funcional; la implementación arranca con la prueba local mínima.*
