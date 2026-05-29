# Changelog

Todas las novedades relevantes de Modulaq se documentan en este archivo.
El formato sigue la idea de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto usa [SemVer](https://semver.org/lang/es/).

## [2.0.0] - 2026-05-29

Cierre de V2: Modulaq pasa de una beta funcional a una versión pública estable,
manteniendo la filosofía frontend-only (sin backend, sin cuentas, sin pagos),
con procesamiento local y costo mensual 0. Publicado en https://modulaq.dev.

### Resumen
Las 10 microherramientas funcionan online en el navegador. Se sumó SSG/SEO por
ruta, documentación indexable en todas las herramientas, código integrable en 9
de 10, favoritos e historial local, analítica anónima y un pulido general de la
presentación pública.

### Cambios principales por bloque
- **V2.0 — Helpers compartidos:** consolidación de utilidades comunes
  (manejo de archivos, parser de rangos de páginas) para reducir duplicación.
- **V2.1 — SSG / SEO:** prerender por ruta con `vite-react-ssg`, `<head>` por
  página (title, description, canonical, Open Graph/Twitter), OG image PNG
  (1200×630), `sitemap.xml` y `robots.txt`, y redirects (`/catalogo` → 301
  `/herramientas`; `/contacto` y `/solicitar-herramienta` canonicalizan a
  `/consultas`).
- **V2.2 — Documentación indexable:** modelo `ToolDoc` en la metadata y
  `ToolDocPanel`; documentadas las 10 herramientas. El panel se renderiza
  siempre en el DOM (atributo `hidden`), por lo que el contenido entra en el
  HTML estático y es indexable.
- **V2.3 / V2.3B / V2.3C — Código integrable:** modelo `ToolIntegrableCode` +
  `CodeSnippetPanel` con botón de copiado, sin librerías de syntax highlighting.
  Snippets autocontenidos (sin imports internos de Modulaq).
  - V2.3: Limpiador de texto y Generador de QR.
  - V2.3B: Contador de páginas PDF, Unir PDFs, Reordenar páginas PDF,
    Dividir PDF y Imagen a PDF (todas con `pdf-lib`).
  - V2.3C: Extraer texto de PDF y PDF a imágenes (con `pdfjs-dist`, worker
    inline orientado a Vite y alternativas CDN/`workerPort` documentadas).
  - Cobertura: **9 de 10 herramientas**.
- **V2.4 — Favoritos e historial local:** `ToolPrefsProvider` (context único),
  wrapper seguro de `localStorage` con claves versionadas
  (`modulaq:favorites:v1`, `modulaq:recent:v1`), estrella de favorito en cards
  y detalle, sección "Usadas recientemente" en Home y chip "Solo favoritos" en
  el catálogo. Sin cuentas ni backend; sin hydration mismatch.
- **V2.5 — Cloudflare Web Analytics:** analítica privacy-first activada desde el
  dashboard de Pages (sin código, sin cookies, sin datos personales). Nota de
  privacidad en el Footer y sección en el README.
- **V2.6A — Pulido público / conversión:** mensaje principal de Home más claro,
  propuesta de valor reforzada (gratis, procesamiento local, documentación,
  código integrable, favoritos/recientes), CTAs, jerarquía de pestañas del
  detalle (Usar online → Documentación → Código integrable → API) y Footer.

### Decisiones deliberadas
- **Comprimir PDF se mantiene sin código integrable** a propósito: el proceso
  real solo reescribe la estructura del PDF (no recomprime imágenes), así que un
  snippet sugeriría una compresión que la herramienta no realiza.
- **Sin backend, sin cookies, sin PII, sin servicios de terceros para tracking**
  (no se usa Google Analytics).
- **Procesamiento 100% local:** los archivos no se suben a ningún servidor.
- **Conteos dinámicos** en la UI (no hardcodeados) para que no queden obsoletos
  al sumar herramientas.

### Pendientes postergados
- **V2.5B — Eventos personalizados:** arquitectura aprobada (Cloudflare Pages
  Function + Analytics Engine, allowlist estricta, sin PII, respeto de DNT,
  fallo silencioso) pero **no implementada**: Web Analytics ya cubre pageviews,
  herramientas visitadas y rendimiento, y todavía no hay una pregunta concreta
  que justifique mantener esa superficie.

---

## Backlog (post-2.0.0)

### Pre-V3 (preparación, sin cambiar arquitectura)
- ✅ **Redirección `www.modulaq.dev` → `modulaq.dev`** (301 en Cloudflare,
  preservando path y query).
- ✅ **Google Search Console:** dominio dado de alta y `sitemap.xml` enviado
  (13 URLs descubiertas en su momento; ahora 14 con `/privacidad`).
- ✅ **Página `/privacidad`:** ruta estática (SSG) con `PageHead` propio y enlace
  en el Footer. Explica procesamiento local, favoritos/historial en
  `localStorage`, consultas vía Web3Forms, analítica anónima de Cloudflare,
  naturaleza documental del código integrable, límites y contacto. Tono claro y
  no legalista. Sin dependencias ni backend.
- **V2.5B — Eventos personalizados:** implementar la arquitectura ya aprobada si
  surge una pregunta concreta de producto.

### V3 (decisiones de plataforma a evaluar)
- **Evaluar API real:** contrato y endpoints para usar herramientas desde un
  backend externo (hoy "API" se muestra como capacidad futura).
- **Evaluar backend:** qué casos lo justifican (procesos pesados, límites,
  persistencia) sin romper la promesa de procesamiento local por defecto.
- **Evaluar paquete npm / SDK:** empaquetar la lógica integrable hoy ofrecida
  como snippets en una librería instalable.

### V3+ (exploración)
- **Nuevas herramientas frontend-only:** ampliar el catálogo manteniendo la
  filosofía "una herramienta = una responsabilidad".
- **Política de límites server-side:** si en algún momento hay procesamiento en
  servidor, definir límites de uso, tamaños y cuotas de forma transparente.

[2.0.0]: https://modulaq.dev
