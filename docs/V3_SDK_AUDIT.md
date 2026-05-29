# Modulaq V3 — Auditoría y diseño preliminar del SDK

> Documento de **auditoría y diseño preliminar**, no de implementación.
> No crea el paquete, no toca código funcional, no agrega dependencias.
> Continúa la decisión estratégica fijada en [V3_VISION.md](./V3_VISION.md).
> Estado base: Modulaq V2 cerrada como `2.0.0`. Dirección aprobada: **SDK-first, primero local/privado**.

---

## 1. Resumen ejecutivo

**Qué es el SDK en el contexto de Modulaq.** Una librería de funciones **puras y reutilizables** extraídas de los `*.service.ts` de cada herramienta, sin React, sin acoplamiento a la UI, instalable en un proyecto del consumidor para hacer lo mismo que hoy hace el sitio (procesar PDFs, texto y QR en el navegador).

**Por qué V3 debe empezar con SDK interno/local.**
- Ya existe el código: cada herramienta tiene un `service.ts` separado de su componente React.
- Valida la API y la DX **sin compromiso público** (sin semver bloqueante, sin issues abiertas).
- Permite **dogfooding**: la propia app puede consumir el paquete y eliminar duplicación.
- Costo 0, sin backend, sin riesgo de privacidad.

**Qué NO se hará todavía.**
- Publicar en npm público.
- Backend / API real.
- Login / cuentas.
- Monetización.
- Nuevas dependencias innecesarias.
- Cambios en SSG, herramientas o versión.

---

## 2. Objetivo técnico del SDK

El SDK debe **separar lógica de UI**: la función `mergePdfs(files)` no debe saber que existe un `<MergePdfTool />`, ni cómo se descarga el resultado, ni cómo se muestran errores. Hoy esa separación ya existe parcialmente (los `service.ts` no importan React), pero la lógica:
- importa helpers internos de Modulaq (`shared/utils/file`, `downloadFileName`, `pageRanges`);
- a veces mezcla responsabilidades (p. ej. `splitPdf` sanitiza nombres de salida internamente, lo que es responsabilidad del consumidor).

**Meta de V3.0.** Una capa con funciones **sin imports de Modulaq**, sin dependencias de UI, **browser-first**, que devuelven primitivas (`Uint8Array`, strings, data URLs) y dejan al consumidor decidir descarga, nombres, errores y UI. La app actual debe poder consumirla en una fase posterior para eliminar el `service.ts` interno y evitar drift.

---

## 3. Criterios de evaluación

| Criterio | Qué significa | Por qué importa |
|---|---|---|
| Independencia de React | No importa nada de `react`/`react-dom` ni hooks. | El SDK debe ser usable sin React. |
| Independencia de DOM | No usa `document`, `window`, `Image`, `URL.createObjectURL` salvo lo estrictamente necesario. | Habilita futuras versiones Node/isomórficas. |
| Compatibilidad browser-first | Funciona en navegador moderno sin polyfills. | Es el target inmediato. |
| Dependencia de `File`/`Blob`/`ArrayBuffer` | Si recibe `File`, asume browser; si recibe `ArrayBuffer`/`Uint8Array`, es más portable. | Cambia el target alcanzable. |
| Dependencia de `canvas`/worker | Requiere `<canvas>` o web worker → solo browser. | Marca la herramienta como "Ola 2" o sólo browser. |
| Dependencia de `pdf-lib` | Carga liviana, isomórfica. | Apto SDK. |
| Dependencia de `pdfjs-dist` | Carga pesada, requiere `workerSrc` configurado por el consumidor. | Requiere documentación específica; Ola 2. |
| Facilidad de testeo | Función pura → testeable sin DOM. | Calidad y mantenimiento. |
| Riesgo de romper herramientas actuales | Si el SDK se "extrae" del service, ¿la app puede seguir compilando? | Define orden de migración. |
| Utilidad real para terceros | ¿Resuelve un problema común o es específico de Modulaq? | Define si entra al SDK público o queda interno. |

---

## 4. Inventario de candidatos

> *Lectura:* "Apto V3.0" = puede entrar a la Ola 1 sin refactor mayor; "Refactor menor" = portable cambiando la firma o aislando una rama DOM-dependiente; "V3.1" = postergar por complejidad o portabilidad; "No apto" = se mantiene como código interno de la app.

| Módulo / función | Archivo | Deps | DOM? | Pureza | Clasificación | Notas |
|---|---|---|---|---|---|---|
| `cleanText`, `getTextStats`, `defaultTextCleanerOptions` | `tools/text/text-cleaner/textCleaner.service.ts` | — | No | Total | **Apto V3.0** | Ideal: cero deps, función pura, isomórfica. |
| `buildQrValue`, `validateQrInput`, `resolveQrOutputSize` | `tools/productivity/qr-generator/qrGenerator.service.ts` | — | No | Total | **Apto V3.0** | Lógica pura de strings/validación. |
| `generateQrPng` | mismo archivo | `qrcode` | No (qrcode maneja todo) | Alta | **Apto V3.0** | `qrcode` funciona browser+Node; devuelve data URL. |
| `countPdfPages` | `tools/pdf/pdf-page-counter/pdfPageCounter.service.ts` | `pdf-lib` | Sólo recibe `File` | Alta | **Apto V3.0 con refactor menor** | Aceptar `ArrayBuffer`/`Uint8Array` además de `File` para portabilidad. |
| `mergePdfFiles` | `tools/pdf/merge-pdf/mergePdf.service.ts` | `pdf-lib` | `File[]` | Alta (pero usa helpers internos para nombres) | **Apto V3.0 con refactor menor** | Quitar la lógica de "nombre de archivo de salida" — debe devolver bytes; el consumidor pone el nombre. |
| `extractSelectedPages` (split) | `tools/pdf/split-pdf/splitPdf.service.ts` | `pdf-lib` | `File` | Alta | **Apto V3.0 con refactor menor** | Idem: separar bytes del nombre/extensión. |
| `createZipFromParts` (split) | mismo | `pdf-lib` + `jszip` | `File` | Alta | **Apto V3.0 (opcional)** | Suma `jszip` como peerDep; podría quedar como helper aparte o sub-export `/pdf/zip`. |
| `splitPdfIntoIndividualPages` (split) | mismo | `pdf-lib` + `jszip` | `File` | Alta | **Apto V3.0 (opcional)** | Mismo caso que el anterior. |
| `reorderPdfPages` | `tools/pdf/reorder-pdf-pages/reorderPdfPages.service.ts` | `pdf-lib` | `File` | Alta | **Apto V3.0 con refactor menor** | Quitar nombre/extensión de la firma. |
| `createPdfFromImages` (PNG/JPG path) | `tools/pdf/image-to-pdf/imageToPdf.service.ts` | `pdf-lib` | No para PNG/JPG | Alta | **Apto V3.0 con refactor menor** | Ofrecer versión PNG/JPG sin DOM. |
| `createPdfFromImages` (WebP path) | mismo | `pdf-lib` + `Image`/`canvas`/`URL` | Sí | Media | **V3.1 o helper aparte** | La conversión WebP→PNG por canvas es browser-only; sacarla del core o documentarla aparte. |
| `extractPdfText` | `tools/pdf/extract-pdf-text/extractPdfText.service.ts` | `pdfjs-dist` (+ worker) | Worker | Media | **V3.1** | Worker config, ~200 líneas de layout reconstruction. Para V3.0 podría existir una versión simplificada (texto continuo), pero la complejidad del worker la mete naturalmente en Ola 2. |
| `convertPdfPagesToPng` | `tools/pdf/pdf-to-images/pdfToImages.service.ts` | `pdfjs-dist` (+ worker) + `canvas` | Sí | Media | **V3.1** | Requiere `<canvas>` → browser-only; igual problema de worker. |
| `compressPdf` | `tools/pdf/compress-pdf/compressPdf.service.ts` | `pdf-lib` | No | Alta | **No apto / mantener interno** | Decisión heredada de V2: no exponer, no genera compresión real (solo re-save). |
| `formatFileSize`, `isPdfFile`, `toArrayBuffer` | `shared/utils/file.ts` | — | `isPdfFile` usa el tipo `File` | Total | **Apto V3.0** | Útiles para consumidores; `isPdfFile` queda browser-only por la firma. |
| `parsePageSelection`, `validateParts` | `shared/utils/pageRanges.ts` | — | No | Total | **Apto V3.0** | 100% lógica pura: ideal para SDK. |
| `getBaseFileName`, `sanitizeDownloadBaseName`, `getSuggestedDownloadBaseName`, `buildDownloadFileName` | `shared/utils/downloadFileName.ts` | — | No | Total | **Apto V3.0** | 100% strings; útil para cualquier consumidor que sirva descargas. |

---

## 5. Olas de implementación recomendadas

### Ola 1 — V3.0 (funciones simples y estables)
- `cleanText` + `getTextStats` (text).
- `generateQrPng`, `buildQrValue`, `validateQrInput`, `resolveQrOutputSize` (qr).
- `countPdfPages` (pdf).
- `mergePdfs` (pdf).
- `splitPdfRange` — extracción de un rango (sin ZIP) en el core; el modo ZIP queda como sub-export opcional con `jszip` peer.
- `reorderPdfPages` (pdf).
- `imagesToPdf` (pdf) — versión PNG/JPG sin DOM.
- Helpers puros: `parsePageSelection`, `validateParts`, `getBaseFileName`, `sanitizeDownloadBaseName`, `buildDownloadFileName`, `formatFileSize`, `toArrayBuffer`.

**Razón.** Mismo modelo mental, una sola dependencia principal por subdominio (`pdf-lib` para PDF, `qrcode` para QR, cero para text/helpers). Todas tienen versión "browser-first" sin `canvas`/worker.

### Ola 2 — V3.1 (funciones delicadas)
- `extractPdfText` (versión simple: texto continuo por página + unido).
- `convertPdfPagesToPng` (render a PNG con `scale`).
- (opcional) `createPdfFromImages` con conversión WebP por canvas.

**Razón.** `pdfjs-dist` necesita `workerSrc` configurado por el consumidor y `convertPdfPagesToPng` además requiere `<canvas>` (browser-only). Conviene madurar primero la Ola 1 y resolver la documentación de worker en una fase dedicada.

### Excluido de V3.0 (y probablemente de V3 entero)
- **Comprimir PDF.** Coherente con V2: el `save({useObjectStreams:true})` real no recomprime imágenes; publicarlo como SDK induciría a error.

---

## 6. Propuesta de estructura futura

Una sola librería con subpath exports, dentro del repo como workspace, sin publicar todavía:

```
packages/
  core/
    package.json        // name: "@modulaq/core" (privado), peerDependencies declaradas
    src/
      text/             // cleanText, getTextStats
      qr/               // buildQrValue, validate*, generateQrPng
      pdf/              // mergePdfs, splitPdfRange, reorderPdfPages, countPdfPages, imagesToPdf
      pdf-zip/          // (opcional) variantes con jszip — sub-export aparte
      files/            // formatFileSize, isPdfFile, toArrayBuffer
      ranges/           // parsePageSelection, validateParts
      names/            // getBaseFileName, sanitize/build download names
      index.ts          // re-export curado
```

**Recomendación.** Empezar como **`packages/core` interno** del repo (workspace npm), con `package.json` marcado `"private": true` y `name: "@modulaq/core"` reservado para un futuro scope público. Esto:
- mantiene todo en el mismo repo (sin pipeline aparte),
- permite que la app lo consuma vía workspace,
- evita comprometerse con npm público antes de validar la API.

> *Alternativa minimalista descartada:* una sola carpeta `src/sdk/` dentro de la app, sin workspace. Es más simple, pero no permite probar el embalaje real (build de librería, tipos, exports), que es justamente lo que se quiere validar.

---

## 7. API pública tentativa

Nombres y firmas tentativos — **no implementar todavía**, solo documentar la intención.

```ts
// @modulaq/core/text
cleanText(input: string, options?: Partial<TextCleanerOptions>): string;
getTextStats(text: string): { characters: number; words: number; lines: number };

// @modulaq/core/qr
buildQrValue(contentType: QrContentType, input: string): string;
validateQrInput(contentType: QrContentType, input: string): QrValidationResult;
generateQrDataUrl(input: string, options?: { size?: number; margin?: number; dark?: string; light?: string }): Promise<string>;

// @modulaq/core/pdf
countPdfPages(source: File | ArrayBuffer | Uint8Array): Promise<number>;
mergePdfs(sources: Array<File | ArrayBuffer | Uint8Array>): Promise<Uint8Array>;
splitPdfRange(source: File | ArrayBuffer | Uint8Array, from: number, to: number): Promise<Uint8Array>;
reorderPdfPages(source: File | ArrayBuffer | Uint8Array, order: number[]): Promise<Uint8Array>;
imagesToPdf(images: Array<File | ArrayBuffer | Uint8Array>, options?: { fit?: "image-size" | "a4" }): Promise<Uint8Array>;

// @modulaq/core/ranges
parsePageRanges(input: string, totalPages: number): PageSelectionResult;
validateParts(parts: string[], totalPages: number): PartsValidationResult;

// @modulaq/core/names
sanitizeFileName(name: string, fallback?: string): string;
ensureFileExtension(name: string, extension: DownloadExtension, fallback?: string): string;
```

**Principios de firma.**
- Aceptar `File | ArrayBuffer | Uint8Array` cuando sea posible (portabilidad).
- Devolver **primitivas** (`Uint8Array`, `string`); el consumidor decide cómo descargar/mostrar/renombrar.
- Opciones siempre por objeto con defaults sensatos.
- Errores tipados o `Error` con mensajes claros y en inglés/idioma neutro (la app pone sus mensajes en español).

---

## 8. Browser-first vs Node

**Recomendación: browser-first para V3.0.** La razón es honesta: hoy todas las herramientas dependen naturalmente de APIs del navegador (`File`, `Blob`, `canvas`, web worker para pdfjs). Forzar isomorfismo en la primera versión multiplicaría el trabajo y agregaría superficie de bug sin beneficio probado.

- `pdf-lib` funciona en ambos, así que las funciones PDF puras (sin canvas) podrán declarar *"isomórfico"* en V3.1 con bajo costo.
- `pdfjs-dist` puede correr en Node con setup, pero su API natural es browser; mejor estabilizarla allí primero.
- `qrcode` y `cleanText` ya son isomórficos por naturaleza.

**Node/isomórfico queda fuera de V3.0**, no porque sea imposible sino porque no es la apuesta inicial; se evalúa en V3.1 una vez consolidada la API browser-first.

---

## 9. Dogfooding

**Plan.** Antes de cualquier publicación pública, la propia app de Modulaq debe consumir el paquete `@modulaq/core` desde el workspace, reemplazando gradualmente la lógica de los `*.service.ts` actuales por re-exports del paquete.

**Objetivos.**
- Eliminar **drift** entre el SDK y los services internos (una sola fuente de verdad).
- Validar la API real con el caso de uso más exigente que ya conocemos: las propias herramientas del sitio.
- Detectar problemas de DX, tipos y errores antes de cualquier issue público.
- Mantener control de cambios: cada cambio en el SDK se ve inmediatamente en la app.

**Cómo (resumen).** El workspace expone `@modulaq/core`; los `service.ts` de cada herramienta se reescriben como adaptadores finos sobre el SDK (mantienen la firma actual donde haga falta para no romper componentes). En cuanto la migración esté completa y verde, los services pueden eliminarse o convertirse en thin re-exports.

> Este dogfooding *no* forma parte de V3.0 escritura del SDK; se ejecuta como fase siguiente (V3.0-migración), pero el diseño del SDK debe contemplarlo desde el principio.

---

## 10. Riesgos técnicos

1. **Drift app↔SDK** — si la app mantiene su propio `service.ts` además del SDK, las divergencias son inevitables. *Mitigación:* dogfooding obligatorio antes de publicar.
2. **Exceso de abstracción** — diseñar para casos hipotéticos en vez de los reales. *Mitigación:* la API se valida primero contra los casos del propio sitio.
3. **Ruptura accidental de herramientas existentes** durante la migración. *Mitigación:* migrar herramienta por herramienta con `npm run build` verde entre pasos.
4. **Dificultad de `pdfjs-dist`** — worker, versionado, ESM. *Mitigación:* dejar para Ola 2 y dedicarle documentación específica.
5. **Dependencia de APIs del navegador** (`File`, `canvas`, `URL.createObjectURL`). *Mitigación:* aceptar `ArrayBuffer`/`Uint8Array` en las firmas; aislar las funciones DOM-dependientes en módulos separados.
6. **Soporte/semver al publicar** — issues, breaking changes, compatibilidad. *Mitigación:* fase pública sólo tras dogfooding sostenido; semver 0.x mientras tanto.
7. **Documentación insuficiente** — un SDK sin README claro es invisible. *Mitigación:* reusar lo ya escrito en el código integrable como base del README inicial.
8. **Bundle inflation** — incluir todo de entrada infla bundles del consumidor. *Mitigación:* ESM-first, subpath exports, `peerDependencies`.

---

## 11. Decisiones pendientes (Nelson)

1. **Nombre del paquete:** `@modulaq/core` (recomendado; requiere reservar scope `@modulaq` en npm cuando se publique) vs `modulaq-core` (sin scope).
2. **Publicación:** privado/local primero (recomendado) o npm público desde el inicio.
3. **Target:** browser-only en V3.0 (recomendado) o intentar Node más adelante (V3.1+).
4. **Alcance V3.0:** confirmar Ola 1 propuesta (text + qr + pdf básicos + helpers) y diferir `pdfjs-dist` y WebP a Ola 2.
5. **Dogfooding:** ¿la app consume el paquete en la misma fase de V3.0, o se hace en una fase siguiente "V3.0-migración"?
6. **Licencia futura:** MIT (recomendado por simplicidad y alineación con el ecosistema) u otra.
7. **Nivel de soporte prometido al publicar** (issues, response time, semver). Mientras esté en 0.x se reserva el derecho a breaking changes.
8. **Medición de demanda antes de publicar:** ¿se confirma que con Search Console + consultas alcanza, o se activa V2.5B para medir cuántos copian snippets?

---

## 12. Próximo paso recomendado

Tras aprobar esta auditoría, el siguiente documento es:

**`docs/V3_SDK_TECHNICAL_DESIGN.md`** — diseño técnico operativo:
- Workspace npm: configuración (`workspaces` en `package.json` raíz, `packages/core/package.json`).
- Build de librería (tsup o vite lib mode), targets ESM + tipos `.d.ts`.
- Estructura final de `exports`/subpath, `peerDependencies` exactas y versiones soportadas.
- Convenciones de naming, errores y tipos.
- Plan de migración de la app (mapa `service.ts` → `@modulaq/core`).
- Tests mínimos para Ola 1.
- Criterios de "listo para dogfooding" y "listo para publicar".

Después del diseño técnico aprobado, recién entonces se hace la **prueba local `packages/core`** con la Ola 1 mínima (probablemente arrancando por `text/cleanText` y `pdf/countPdfPages`, los dos más simples) para validar el embalaje antes de migrar el resto.

---

*Fin de la auditoría preliminar. No se modificó código funcional; el diseño técnico operativo y la prueba local se planifican en documentos posteriores.*
