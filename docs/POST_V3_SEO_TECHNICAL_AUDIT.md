# Modulaq Post-V3 - Auditoria SEO tecnica

> Documento de auditoria tecnica.
> No modifica codigo funcional, metadata, SSG, herramientas, version, dependencias, npm publish ni abre V3.2.
> Contexto base: V3 esta cerrada; `docs/POST_V3_SEO_GROWTH_PLAN.md` fue creado y aprobado.

---

## 1. Resumen ejecutivo

La base SEO tecnica de Modulaq esta en buen estado para una etapa inicial: hay SSG con `vite-react-ssg`, `PageHead` centralizado, titles/descriptions por ruta, canonicals absolutos en `https://modulaq.dev`, Open Graph/Twitter metadata, `robots.txt`, sitemap generado post-build y documentacion por herramienta.

La limitacion principal no parece ser arquitectura. El riesgo principal es de visibilidad y diferenciacion: varias paginas tienen contenido util, pero todavia pueden reforzar intencion de busqueda, procesamiento local/privacy-first y enlaces internos entre herramientas relacionadas.

Recomendacion general: si se aprueba implementar despues de esta auditoria, conviene empezar con mejoras SEO basicas de bajo riesgo. No conviene abrir V3.2, redisenar, agregar features, tocar backend/API, preparar npm publish ni montar una estrategia de contenido grande todavia.

---

## 2. Fuentes revisadas

Archivos principales revisados:

- `src/shared/seo/PageHead.tsx`
- `src/shared/constants/site.ts`
- `src/app/routes/routes.tsx`
- `src/app/routes/routePaths.ts`
- `src/pages/Home/HomePage.tsx`
- `src/pages/ToolsCatalog/ToolsCatalogPage.tsx`
- `src/pages/ToolDetail/ToolDetailPage.tsx`
- `src/pages/Consultations/ConsultationsPage.tsx`
- `src/pages/Privacy/PrivacyPage.tsx`
- `src/pages/NotFound/NotFoundPage.tsx`
- `src/features/tools/data/tools.ts`
- `src/features/tools/components/ToolDocPanel.tsx`
- `src/features/tools/components/CodeSnippetPanel.tsx`
- `src/features/tools/components/ToolCard.tsx`
- `src/app/layout/Header.tsx`
- `src/app/layout/Footer.tsx`
- `scripts/generate-sitemap.mjs`
- `public/robots.txt`
- `public/_redirects`
- `public/og-image.png`

---

## 3. Titles por ruta

`PageHead` compone titles como `${title} · Modulaq`, salvo cuando `bareTitle` esta activo. Home usa `bareTitle`.

| Ruta | Title actual |
|---|---|
| `/` | `Modulaq — Microherramientas digitales modulares` |
| `/herramientas` | `Herramientas online gratis · Modulaq` |
| `/consultas` | `Consultas · Modulaq` |
| `/privacidad` | `Privacidad · Modulaq` |
| `/404` | `Pagina no encontrada · Modulaq` + `noindex` |

Titles por herramienta:

| Ruta | Title actual |
|---|---|
| `/herramientas/unir-pdfs` | `Unir PDFs online gratis · Modulaq` |
| `/herramientas/dividir-pdf` | `Dividir PDF online gratis · Modulaq` |
| `/herramientas/imagen-a-pdf` | `Convertir imagenes a PDF online · Modulaq` |
| `/herramientas/pdf-a-imagenes` | `Convertir PDF a imagenes PNG · Modulaq` |
| `/herramientas/comprimir-pdf` | `Comprimir PDF online gratis · Modulaq` |
| `/herramientas/extraer-texto-de-pdf` | `Extraer texto de un PDF · Modulaq` |
| `/herramientas/contador-de-paginas-pdf` | `Contar paginas de un PDF · Modulaq` |
| `/herramientas/reordenar-paginas-pdf` | `Reordenar paginas de un PDF · Modulaq` |
| `/herramientas/limpiador-de-texto` | `Limpiar y normalizar texto · Modulaq` |
| `/herramientas/generador-de-qr` | `Generador de codigos QR gratis · Modulaq` |

Hallazgo: los titles existen y son unicos. Las oportunidades principales son reforzar "sin subir archivos", "en navegador" o "localmente" en algunas paginas PDF donde la query lo justifique, sin alargar demasiado.

---

## 4. Meta descriptions

Todas las rutas revisadas tienen `meta name="description"` via `PageHead`.

Estado por tipo:

- Home: descriptiva, menciona plataforma frontend-only y tareas principales.
- Catalogo: descriptiva, menciona PDF, texto, productividad, gratis y navegador.
- Consultas: suficiente para una pagina funcional, no es una pagina SEO prioritaria.
- Privacidad: fuerte, descriptiva y clara sobre local processing, metricas anonimas, cookies y cuentas.
- Herramientas: todas tienen descriptions unicas en `tool.seo.description`.

Descriptions de herramientas:

| Herramienta | Estado |
|---|---|
| Unir PDFs | Buena; menciona orden, gratis, navegador y no subida |
| Dividir PDF | Buena; menciona rangos, descarga, gratis y navegador |
| Imagen a PDF | Buena; menciona formatos, marcas de agua y procesamiento local |
| PDF a imagenes | Buena; menciona PNG, descarga, navegador y no subida |
| Comprimir PDF | Correcta pero sensible; "reducir" puede generar expectativas aunque aclara resultados honestos |
| Extraer texto de PDF | Buena; menciona TXT, gratis y procesamiento local |
| Contador de paginas PDF | Buena; menciona no subir archivo |
| Reordenar paginas PDF | Buena; menciona navegador y no subida |
| Limpiador de texto | Buena; menciona navegador, no privacidad explicitamente |
| Generador QR | Buena; menciona navegador, no privacidad explicitamente |

Hallazgo: las descriptions son unicas y suficientes. La mejora mas clara es hacer mas consistente la promesa privacy-first/local processing en herramientas no-PDF cuando corresponda, sin forzar keywords.

---

## 5. Canonicals

`PageHead` construye canonicals absolutos usando:

```text
https://modulaq.dev
```

Estado:

- Home canonicaliza a `https://modulaq.dev/`.
- Herramientas canonicaliza a `https://modulaq.dev/herramientas`.
- Cada herramienta canonicaliza a `https://modulaq.dev/herramientas/<slug>`.
- Privacidad canonicaliza a `https://modulaq.dev/privacidad`.
- Consultas canonicaliza a `https://modulaq.dev/consultas`.
- `/contacto` y `/solicitar-herramienta` renderizan `ConsultationsPage`, pero `PageHead` usa `path="/consultas"`, por lo que canonicalizan a `/consultas`.
- 404 usa `path="/404"` y `noindex`.

Rutas de compatibilidad:

- `public/_redirects` redirige `/catalogo` a `/herramientas` con 301.
- SPA fallback: `/* /index.html 200`.

Hallazgo: dominio y canonicals son coherentes. La exclusion de `/contacto` y `/solicitar-herramienta` del sitemap coincide con su canonical a `/consultas`.

---

## 6. Sitemap

`scripts/generate-sitemap.mjs` escanea `dist` despues del build y escribe `dist/sitemap.xml`.

Cantidad esperada/observada en builds recientes:

- 14 URLs.

Rutas incluidas:

- `/`
- `/consultas`
- `/herramientas`
- `/herramientas/comprimir-pdf`
- `/herramientas/contador-de-paginas-pdf`
- `/herramientas/dividir-pdf`
- `/herramientas/extraer-texto-de-pdf`
- `/herramientas/generador-de-qr`
- `/herramientas/imagen-a-pdf`
- `/herramientas/limpiador-de-texto`
- `/herramientas/pdf-a-imagenes`
- `/herramientas/reordenar-paginas-pdf`
- `/herramientas/unir-pdfs`
- `/privacidad`

Rutas excluidas por script:

- `/contacto`
- `/solicitar-herramienta`
- `/404`

Hallazgo: sitemap esta alineado con canonicals y rutas indexables principales. No incluye `lastmod`, `changefreq` ni `priority`; eso no bloquea, pero puede evaluarse mas adelante si hay necesidad.

---

## 7. Robots.txt

`public/robots.txt` existe.

Contenido relevante:

```text
User-agent: *
Allow: /

Sitemap: https://modulaq.dev/sitemap.xml
```

Hallazgo: correcto para estado actual. No bloquea recursos ni rutas. Declara sitemap absoluto.

---

## 8. Open Graph / Twitter metadata

`PageHead` genera:

- `og:type=website`
- `og:locale=es_ES`
- `og:site_name`
- `og:title`
- `og:description`
- `og:url`
- `og:image`
- `og:image:type`
- `og:image:width=1200`
- `og:image:height=630`
- `twitter:card=summary_large_image`
- `twitter:title`
- `twitter:description`
- `twitter:image`

OG image:

- `public/og-image.png` existe.
- `public/og-image.svg` tambien existe como fuente/alternativa.

Hallazgo: cobertura social buena. No se observa `twitter:site`, pero no es critico. La imagen OG es global, no especifica por herramienta; eso es aceptable en esta fase.

---

## 9. Headings

Estado por pagina:

- Home: H1 `Modulaq`; H2 `Util, privado y listo para integrar`; H3 por principio.
- Herramientas: H1 `Herramientas online gratis`; H2 para filtros; H3 en cards de herramienta.
- Consultas: H1 `Un canal para ideas, reportes y feedback`.
- Privacidad: H1 `Privacidad en Modulaq`; H2 para secciones.
- Herramienta individual: H1 usa `tool.name`; documentacion usa H3 para `Como usarla`, `Casos de uso`, `Limites`, `Privacidad`, etc.
- 404: H1 `Pagina no encontrada`.

Hallazgo: cada pagina indexable tiene H1 claro. En herramientas, el H1 es mas corto que el title SEO. Por ejemplo, title `Unir PDFs online gratis` pero H1 `Unir PDFs`. Esto no es error, pero hay oportunidad de alinear mejor H1/subcopy con intencion de busqueda sin cambiar UI de fondo.

---

## 10. Contenido indexable

Contenido disponible:

- Home tiene copy sobre herramientas, privacidad y procesamiento local.
- Catalogo lista cards de herramientas con nombre y descripcion.
- Cada herramienta tiene:
  - H1.
  - Descripcion.
  - Badges de estado/categoria/precio.
  - Pestaña online.
  - Documentacion por herramienta.
  - Snippets de codigo integrable cuando existen.
  - Detalles tecnicos.
- Privacidad tiene contenido fuerte y secciones claras.

Detalle tecnico importante:

- Las herramientas interactivas se renderizan con `ClientOnly` y `React.lazy`, lo que evita ejecutar logica pesada en SSG.
- La documentacion y snippets viven en paneles/tabpanels que se renderizan como contenido React. En estado inicial, las pestañas no activas usan `hidden`.

Riesgo SEO:

- Google puede ver contenido HTML prerenderizado si esta en el markup final, pero contenido en tabs ocultos puede tener menos peso que contenido visible principal.
- Las paginas de herramienta tienen contenido util, pero la parte mas SEO-orientada puede estar debajo de tabs, no en el primer bloque visible.

Hallazgo: hay suficiente base indexable para una etapa inicial, pero las paginas de herramienta podrian beneficiarse de copy visible breve orientado a busqueda y privacidad antes de la UI interactiva o cerca del H1.

---

## 11. Internal linking

Enlaces actuales:

- Header: Inicio, Herramientas, Consultas.
- Footer: Herramientas, Consultas, Privacidad, email.
- Home: CTA a Herramientas y Consultas.
- Catalogo: cards enlazan a cada herramienta.
- Herramienta: enlace de vuelta al catalogo.
- Privacidad: enlace a Consultas.
- `/catalogo`: redirect 301 a `/herramientas`.

Ausencias:

- No se observan enlaces contextuales entre herramientas relacionadas.
- No hay bloque de "herramientas relacionadas" en paginas de herramienta.
- No hay enlaces visibles desde cada herramienta hacia Privacidad, salvo footer global.
- No hay paginas guia aun.

Hallazgo: el linking basico funciona. La oportunidad principal es agregar enlaces internos contextuales de bajo riesgo despues de la auditoria: por ejemplo, Unir PDFs <-> Dividir PDF <-> Reordenar paginas PDF.

---

## 12. Privacidad / procesamiento local

Donde aparece:

- Home hero y panel: "Tus archivos no se suben..." y "Procesamiento local".
- Home principios: "Gratis y privado".
- Footer: "Tus archivos se procesan en tu navegador..."
- Pagina Privacidad: seccion completa y clara.
- Documentacion de cada herramienta: campo `privacy`.
- Meta descriptions de varias herramientas PDF.

Estado:

- La promesa existe y esta bien alineada con el producto.
- En herramientas PDF aparece de forma consistente en descriptions y docs.
- En herramientas no-PDF aparece menos fuerte, aunque tambien aplica a texto/QR.

Oportunidad:

- Reforzar una frase visible y consistente en herramientas PDF: "Se procesa localmente en tu navegador; tus archivos no se suben".
- En Texto y QR, reforzar que el contenido no se envia a servidores, sin exagerar.

---

## 13. Performance SEO

Fortalezas:

- SSG activo.
- `PageHead` se renderiza por ruta.
- Herramientas interactivas bajo `ClientOnly`.
- Renderers de herramientas cargados con `React.lazy`.
- Sitemap generado despues del build.
- No hay backend necesario para las herramientas actuales.

Riesgos:

- `pdfjs-dist`, `pdf-lib`, `jszip` y `qrcode` pueden generar chunks pesados.
- `pdf.worker.min.mjs` aparece como asset grande en builds.
- Si una importacion accidental moviera `pdfjs-dist` al bundle comun, podria afectar rutas que no necesitan PDF render.
- El contenido en tabs hidden puede ser menos prominente para SEO que contenido visible.

Hallazgo: la arquitectura actual ya evita bastante carga inicial por lazy loading. El riesgo a vigilar es que futuras mejoras SEO no importen componentes de herramienta pesada en rutas globales o compartidas.

---

## 14. Riesgos SEO actuales

Riesgos principales:

- Titles correctos pero algunos pueden ser genericos frente a competidores.
- Descriptions buenas, aunque no siempre maximizan busquedas de "sin subir archivos".
- Falta contenido visible orientado a busquedas en la parte alta de cada herramienta.
- La diferenciacion privacy-first existe, pero podria ser mas consistente.
- No hay paginas guia o informativas para consultas long-tail.
- No hay enlazado interno contextual entre herramientas relacionadas.
- `Comprimir PDF` requiere cuidado editorial para no prometer compresion real.
- Paginas utiles pero poco encontrables si dependen solo del catalogo y sitemap.

No se detecta como riesgo principal:

- Falta de sitemap.
- Falta de robots.
- Falta de canonical.
- Falta total de metadata.
- Falta de H1.

---

## 15. Acciones recomendadas

### Bajo riesgo

- Revisar titles de herramientas para incluir mejor intencion local/privacy cuando sea natural.
- Ajustar meta descriptions para consistencia privacy-first.
- Agregar o reforzar una frase visible de procesamiento local en paginas PDF.
- Alinear H1/subcopy de herramientas con la intencion SEO sin cambiar layout.
- Revisar que `Comprimir PDF` mantenga wording honesto.
- Confirmar sitemap post-build en cada release.
- Revisar Search Console tras cada cambio.

### Riesgo medio

- Agregar enlaces internos contextuales entre herramientas relacionadas.
- Crear paginas guia estaticas puntuales.
- Crear una landing de "Privacidad y procesamiento local".
- Mover parte de la documentacion critica fuera de tabs hidden o duplicar un resumen visible.
- Agregar FAQs estaticas por herramienta si encajan con la UI actual.

### Postergar

- Blog grande.
- Rediseño.
- Nuevas herramientas para crecimiento.
- Backend/API.
- Monetizacion.
- npm publish.
- Cambios profundos de SSG.
- Automatizacion masiva de contenido.

---

## 16. Quick wins recomendados

No implementar todavia. Candidatos concretos para una fase posterior:

1. Ajustar Home description para mencionar "procesamiento local" o "sin subir archivos" de forma mas directa.
2. Ajustar `/herramientas` description para decir "herramientas PDF, texto y QR" en lugar de "productividad" si se quiere mas precision.
3. Reforzar en cada pagina PDF una frase visible cerca del H1: "Procesado localmente en tu navegador; tus archivos no se suben".
4. Revisar title de `Imagen a PDF` para incluir "sin subir archivos" si no queda demasiado largo.
5. Revisar title/description de `Comprimir PDF` para mantener maxima honestidad sobre resultados.
6. Agregar enlaces internos entre:
   - Unir PDFs -> Dividir PDF -> Reordenar paginas PDF.
   - PDF a imagenes -> Extraer texto de PDF.
   - Imagen a PDF -> Unir PDFs.
7. Crear una pagina guia estatica corta: "Como unir PDFs sin subir archivos".
8. Crear una pagina guia estatica corta: "Que significa procesamiento local".
9. Revisar si documentation/snippets ocultos por tabs necesitan un resumen visible adicional.
10. Validar en Search Console que las 14 URLs del sitemap esten descubiertas/indexadas.

---

## 17. Recomendacion final

Conviene implementar mejoras SEO basicas despues de esta auditoria, empezando por bajo riesgo.

No conviene esperar pasivamente mas datos si la visibilidad inicial todavia es baja: una base de metadata/copy mas clara ayudara a generar mejores datos. Pero tampoco conviene abrir V3.2 ni crear un bloque grande de contenido sin medicion.

Recomendacion practica:

1. Aprobar esta auditoria.
2. Crear un plan de cambios SEO base pequeno y revisable.
3. Implementar solo cambios de bajo riesgo.
4. Ejecutar `npm run test:run` y `npm run build`.
5. Dejar correr 2-4 semanas.
6. Analizar Search Console y Cloudflare Analytics.
7. Decidir si corresponde crear paginas guia o esperar mas datos.

No tocar backend/API/monetizacion/npm publish. No redisenar. No abrir V3.2.
