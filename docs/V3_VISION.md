# Modulaq V3 — Documento de visión y decisión de plataforma

> Documento de **planificación**, no de implementación. No cambia código, dependencias, herramientas, SSG ni versión.
> Estado base: Modulaq V2 cerrada como `2.0.0`, publicado en https://modulaq.dev.

---

## 1. Resumen ejecutivo

**Qué busca resolver V3.** V2 dejó un producto público estable y autocontenido. V3 decide **cómo crece Modulaq sin traicionar su promesa central** (procesamiento local, privacy-first, costo ~0). La pregunta de fondo: ¿ampliamos el *alcance para desarrolladores* (reutilizar la lógica fuera del sitio) o introducimos una *superficie server-side* (API/backend)?

**Qué se mantiene de V2.** Toda la base: frontend-only, SSG/SEO, documentación indexable, código integrable (9/10), favoritos/historial local, analítica anónima, contacto vía Web3Forms, sin login ni cookies propias.

**Qué tipo de decisiones se toman acá.** Decisiones de **plataforma**, no tareas sueltas: elegir una dirección para V3.0, definir invariantes innegociables, y fijar las condiciones bajo las cuales se reconsideraría API/backend.

---

## 2. Estado actual de Modulaq

**Resumen de V2.** 10 microherramientas (8 PDF, limpiador de texto, generador de QR) que corren 100% en el navegador. SSG con `vite-react-ssg`, SEO por ruta, sitemap/robots/OG, documentación indexable en las 10, código integrable en 9 (Comprimir PDF excluida a propósito), favoritos/recientes en `localStorage`, Cloudflare Web Analytics, página `/privacidad`, Search Console y redirección `www`→apex.

**Fortalezas actuales.**
- Promesa clara y diferencial: *tus archivos no se suben*.
- Costo operativo ~0 (solo dominio/infra de Pages).
- Base técnica limpia: servicios por herramienta ya separados de la UI (lógica pura reutilizable).
- SEO sólido y contenido indexable.
- Sin deuda de privacidad (sin cookies/PII/login).

**Límites actuales.**
- El valor para desarrolladores hoy es *copiar y pegar* snippets; no hay forma instalable/versionada.
- Sin medición de interacciones finas (eventos) → decisiones de producto basadas solo en pageviews.
- Procesos pesados o archivos muy grandes dependen del equipo del usuario (límite inherente al modelo local).
- Sin "API" real (se muestra como futura).

---

## 3. Invariantes a proteger (innegociables salvo decisión explícita)

1. **Procesamiento local por defecto** — el modo base de cualquier herramienta corre en el navegador.
2. **Privacy-first** — sin cookies propias, sin PII, sin fingerprinting.
3. **Costo mensual 0 o mínimo** — nada que introduzca facturación recurrente sin justificación fuerte.
4. **Sin backend salvo necesidad justificada** — la carga de la prueba está en quien propone el server-side.
5. **SSG/SEO intacto** — no degradar prerender, rutas indexables ni performance.
6. **No subir archivos sin explicación clara** — si alguna vez se sube algo, debe ser opt-in y transparente.
7. **Simplicidad de mantenimiento** — preferir lo que un mantenedor solo puede sostener.

---

## 4. Problemas u oportunidades para V3

- **Reutilización real del código integrable.** Los snippets ya están escritos, probados y documentados. Empaquetarlos como funciones instalables es el camino de menor fricción para pasar de "copiar" a "instalar".
- **Demanda de SDK/npm.** *Hipótesis, no validada.* Atractiva porque capitaliza lo hecho y respeta invariantes; falta señal de demanda.
- **Demanda de API.** Permitiría usar herramientas desde un backend ajeno, pero choca con "local/costo 0/privacidad".
- **Necesidad de backend.** Solo se justifica para procesos que el navegador no puede (archivos enormes, OCR pesado, recompresión real de PDF).
- **Nuevas herramientas frontend-only.** Crecimiento orgánico de bajo riesgo, pero con riesgo de dispersión.
- **Medición de eventos (V2.5B).** Útil para *responder preguntas*; sin pregunta concreta, es mantenimiento sin retorno.
- **Mejoras de confianza/privacidad.** `/privacidad` ya existe; quedan mejoras menores (OG por ruta, indexación).

---

## 5. Direcciones candidatas

### A. SDK / paquete npm (librería reutilizable)
- **Qué sería.** Empaquetar la lógica pura ya existente (las *services* de cada herramienta) como funciones instalables y tipadas.
- **Qué problema resuelve.** Convierte el "copiá este snippet" en "instalá y usá", con tipos, versionado y tree-shaking.
- **Pros.** Capitaliza el código integrable; corre en el entorno del consumidor (sigue siendo *local*); costo 0 (publicar en npm es gratis); sin backend; sin riesgo de privacidad nuevo; refuerza la marca ante desarrolladores.
- **Contras.** Demanda no probada; agrega mantenimiento (semver, builds, tipos, soporte); riesgo de *drift* entre el paquete y las copias internas de la app.
- **Riesgos.** Portabilidad navegador↔Node (File, `canvas`, worker de pdfjs); expectativa de soporte al publicar; naming/namespace.
- **Costos.** ~0 monetario; sí costo de tiempo de mantenimiento.
- **Relación con Código integrable.** Es su evolución natural: los snippets son el "borrador documental"; el SDK es la versión soportada.
- **Encaje con procesamiento local.** Total: la lógica corre donde el consumidor la ejecute (browser o Node), nunca en un server de Modulaq.

### B. API real
- **Qué sería.** Endpoints HTTP para ejecutar herramientas desde un backend externo.
- **Qué problema resuelve.** Uso programático sin incluir la lógica en el cliente; integraciones server-to-server.
- **Pros.** Habilita casos que un SDK cliente no cubre; potencial de monetización futura.
- **Contras.** Rompe varios invariantes de golpe.
- **Riesgos de privacidad.** Para procesar, el usuario **subiría archivos** a un server → contradice la promesa central.
- **Costos potenciales.** Cómputo, ancho de banda, almacenamiento temporal → fin del costo 0.
- **Seguridad.** Autenticación, abuso, validación de entrada, manejo de archivos maliciosos.
- **Rate limits.** Imprescindibles → más complejidad operativa.
- **Candidatas.** Solo tendría sentido para operaciones "puras" y baratas (contar páginas, unir, dividir); las pesadas agravan el costo.

### C. Backend para procesos pesados
- **Qué sería.** Servicio server-side para lo que el navegador no puede (OCR, recompresión real de imágenes en PDF, archivos enormes).
- **Casos posibles.** "Comprimir PDF de verdad" (recomprimir imágenes), OCR de PDFs escaneados, batch grande.
- **Pros.** Desbloquea capacidades imposibles en cliente; podría cerrar la brecha de Comprimir PDF.
- **Contras.** Subir archivos, costos variables, seguridad, complejidad, contradice la promesa local.
- **Riesgos de subir archivos.** Confianza, cumplimiento, retención, borrado garantizado.
- **Costos.** Los más altos de todas las opciones.
- **Complejidad.** La mayor; difícil de sostener para un mantenedor solo a costo bajo.

### D. Nuevas herramientas frontend-only
- **Qué aporta.** Más utilidad y superficie SEO, manteniendo el modelo actual.
- **Pros.** Riesgo bajo, costo 0, encaje perfecto con V2.
- **Contras / riesgo de dispersión.** Catálogo inflado sin foco; mantenimiento creciente; dilución de calidad.
- **Cuándo conviene.** Cuando haya demanda concreta de una herramienta específica, no como crecimiento por inercia.

### E. Eventos personalizados (V2.5B)
- **Qué aportan.** Medir interacciones finas (copiar snippet, abrir doc/integrable, favoritos).
- **Pros.** Datos para priorizar; arquitectura ya aprobada (Pages Function + Analytics Engine, allowlist, sin PII, DNT, fallo silencioso).
- **Contras.** Superficie server-side mínima a mantener; sin valor si no hay una pregunta concreta.
- **Por qué no es prioridad.** Web Analytics ya cubre vistas/rutas/rendimiento. Conviene activarlo *cuando V3 plantee una pregunta medible* (p. ej. "¿se usa el código integrable lo suficiente como para justificar un SDK?").

---

## 6. Matriz comparativa

Escala: ↑↑ muy alto / ↑ alto / → medio / ↓ bajo / ↓↓ muy bajo. (Para "riesgo", "costo" y "mantenimiento", **menos es mejor**.)

| Dirección | Impacto usuario | Impacto técnico | Costo mensual | Riesgo privacidad | Mantenimiento | Coherencia con V2 | Velocidad impl. |
|---|---|---|---|---|---|---|---|
| **A. SDK/npm** | → (devs) | → | ↓↓ (0) | ↓↓ | → | ↑↑ | ↑ |
| **B. API real** | ↑ (devs) | ↑↑ | ↑↑ | ↑↑ | ↑↑ | ↓↓ | ↓↓ |
| **C. Backend pesado** | ↑ (nichos) | ↑↑ | ↑↑ | ↑↑ | ↑↑ | ↓↓ | ↓↓ |
| **D. Nuevas tools FE** | ↑ (usuarios) | ↓ | ↓↓ (0) | ↓↓ | ↑ (acumulativo) | ↑↑ | ↑↑ |
| **E. Eventos V2.5B** | ↓ (indirecto) | ↓ | ↓ (~0) | ↓ | → | ↑ | ↑ |

**Lectura.** A y D son las únicas que preservan *todos* los invariantes. B y C los rompen (privacidad/costo/backend). E es barata pero indirecta y prematura sin pregunta.

---

## 7. Recomendación para V3.0

**Dirección recomendada: A — SDK / paquete reutilizable**, evaluada críticamente.

**Por qué.** Es la única dirección que *expande el valor de Modulaq hacia desarrolladores* sin romper ningún invariante: capitaliza el código integrable ya escrito y probado, corre en el entorno del consumidor (sigue siendo procesamiento local), tiene costo 0 y no introduce backend ni riesgos de privacidad. D (nuevas herramientas) también respeta invariantes, pero es crecimiento incremental sin tesis nueva; conviene como flujo continuo, no como "la dirección de V3".

**Matiz crítico (importante).** La demanda del SDK **no está validada**. Por eso V3.0 **no** debe arrancar publicando en npm público, sino:
1. **Validar la hipótesis de forma barata** (señales: queries en Search Console, consultas recibidas, y —si hace falta medirlo— recién ahí activar V2.5B para cuantificar el uso del código integrable).
2. **Construir el paquete primero como librería local/privada** y *dogfoodearla* dentro de la propia app, antes de comprometerse con publicación pública y semver.

**Qué queda fuera de V3.0.** API, backend, login, pagos, procesamiento server-side (ver §9).

**Condiciones para reconsiderar API/backend.** Solo si aparece, con evidencia:
- demanda repetida de uso server-to-server (API), **o**
- una capacidad imposible en cliente y muy pedida (p. ej. recompresión real de PDF / OCR) que justifique el costo y la subida de archivos (backend),
- y existe un modelo que **no** rompa costo 0 sin un plan de sostenibilidad (p. ej. límites estrictos, opt-in explícito, transparencia de retención).

---

## 8. Alcance propuesto de V3.0 (si se confirma SDK)

**Qué incluir primero — las funciones puras de menor riesgo y mayor reúso (ya existentes como *services*):**
- **PDF (con `pdf-lib`):** unir, dividir (extraer rango), reordenar, contar páginas, imágenes→PDF. Comparten una sola dependencia y patrón `load → manipular → save`.
- **Texto (sin dependencias):** `cleanText` + `getTextStats`.
- **QR (con `qrcode`):** construir valor / validar / generar.
- **Segunda ola (mayor cuidado):** extraer texto y PDF→imágenes (`pdfjs-dist`): requieren worker/`canvas` y son *browser-first*; documentar caveats o dejarlas para V3.1.
- **Excluido:** "comprimir" real (igual que en el sitio, para no prometer recompresión que no hace).

**Estructura tentativa de paquete.** Empezar con **un solo paquete con *subpath exports*** por dominio, tree-shakeable y ESM-first:
```
@modulaq/tools
  ├─ /pdf    (merge, split, reorder, countPages, imagesToPdf)
  ├─ /text   (cleanText, getTextStats)
  └─ /qr     (buildQrValue, validate, generate)
```
- **peerDependencies** para `pdf-lib`, `qrcode`, `pdfjs-dist`, `jszip` → el consumidor controla versiones y no se duplican.
- Tipos TS incluidos; build de librería (ESM + d.ts). *La herramienta de build se decide en el diseño técnico, no acá.*

**¿Privado/local primero o npm público?** **Local/privado primero.** Desarrollar como paquete en workspace, *dogfoodearlo* re-usándolo desde la app para validar API/DX, y **publicar público solo cuando la interfaz esté estable** y haya señal de demanda. Esto evita comprometer semver y soporte prematuramente.

**Cómo documentarlo.** Reusar el contenido ya escrito en el código integrable como base del README de cada subpaquete; ejemplos copy-paste idénticos a los del sitio; aclarar browser vs Node por función.

**Riesgos.** Drift app↔paquete; portabilidad navegador/Node; worker/canvas de pdfjs; expectativa de soporte al publicar; naming/namespace npm.

**Pasos incrementales (alto nivel, no implementación).**
1. Auditoría de helpers reutilizables (¿qué es realmente portable y con qué deps?).
2. Diseño técnico del paquete (estructura, exports, build, target browser/Node, peerDeps).
3. Prueba de **paquete local** con el subconjunto de menor riesgo (PDF pdf-lib + texto + QR).
4. Dogfooding dentro de la app (validación de DX y de que no hay drift).
5. Documentación + ejemplos.
6. Decisión de publicación pública (semver inicial, licencia, soporte).

---

## 9. Fuera de alcance de V3.0 (explícito)

- Login / cuentas.
- Pagos / monetización.
- Backend pesado / procesamiento server-side de archivos.
- API pública completa.
- Subida de archivos a servidores de Modulaq.
- Eventos personalizados (V2.5B) **si no hay una pregunta concreta** que medir.
- Nuevas herramientas no relacionadas con el foco del SDK.
- Recompresión real de PDF / OCR (dependen de backend).

---

## 10. Preguntas abiertas (decisiones de Nelson antes de implementar)

1. **¿Hay señal de demanda de SDK** o es hipótesis? ¿Cómo validarla (Search Console, consultas, o activar V2.5B para medir uso del código integrable)?
2. **Target del paquete:** ¿browser-only, Node, o isomórfico? (define cómo tratar `File`, `canvas` y el worker de pdfjs).
3. **Naming/namespace:** `@modulaq/*` (requiere org/scope en npm) vs un único `modulaq-tools`.
4. **Publicación:** ¿privado/local primero (recomendado) o público desde el inicio?
5. **peerDependencies vs deps incluidas** para `pdf-lib`/`qrcode`/`pdfjs-dist`/`jszip`.
6. **Dogfooding:** ¿la app debe consumir el paquete en V3.0 (valida y evita drift) o se mantienen separados por ahora?
7. **Licencia** (¿MIT?) y nivel de **compromiso de soporte/semver** al publicar.
8. **Alcance inicial:** ¿arrancar solo con PDF(pdf-lib)+texto+QR y dejar pdfjs para V3.1?

---

## 11. Próximo paso recomendado

Tras aprobar esta visión, el siguiente documento debería ser una **"Auditoría de helpers reutilizables + diseño técnico del SDK"**, que:
- inventaríe cada *service*/helper y clasifique su **portabilidad** (browser / Node / isomórfico) y dependencias;
- defina la **interfaz pública** del paquete y su estructura de exports;
- proponga el **build de librería** y el **target**;
- y habilite el paso siguiente: una **prueba de paquete local** dogfoodeada en la app.

Si en cambio se elige otra dirección (B/C/D), el próximo documento sería el *design brief* específico de esa opción (p. ej. para backend: modelo de subida/retención/límites y costos).

---

*Fin del documento de visión. No implica cambios de código; la implementación se planifica en documentos posteriores.*
