# Modulaq Post-V3 - Plan SEO/Growth organico

> Documento de planificacion conservadora.
> No modifica codigo, SEO, SSG, herramientas, version, dependencias, npm publish ni abre V3.2.
> Contexto base: V3 esta cerrada formalmente; `@modulaq/core` existe como SDK local; tests, CI y branch protection estan activos.

---

## 1. Resumen ejecutivo

Modulaq no deberia congelarse completamente despues de V3. La base tecnica esta estable, pero un sitio publico necesita visibilidad, confianza y senales organicas para aprender que herramientas interesan, que consultas llegan y que paginas merecen optimizacion.

Tampoco conviene esperar datos perfectos antes de hacer SEO base. Si la visibilidad inicial es baja, Search Console y Cloudflare Analytics tardan mas en producir informacion util. Una primera capa conservadora de copy, metadata, headings, privacidad y enlazado puede mejorar la indexacion y generar mejores datos sin cambiar arquitectura ni producto.

Este plan evita tocar:

- Features nuevas.
- Backend/API.
- Monetizacion.
- Redisenos.
- Dependencias.
- Publicacion npm.
- V3.2.
- Cambios profundos en SSG o herramientas.

La estrategia recomendada es: estabilizar la base organica, observar datos durante algunas semanas y recien despues decidir si hace falta una fase tecnica nueva.

---

## 2. Objetivos

Objetivos Post-V3:

- Mejorar el descubrimiento de Modulaq en Google.
- Reforzar confianza publica.
- Destacar el procesamiento local y privacy-first.
- Aumentar impresiones organicas.
- Preparar mejores datos para analisis posterior.
- Identificar que herramientas reciben busquedas reales.
- Evitar trabajo tecnico prematuro sin evidencia.

El objetivo no es escalar agresivamente ni competir por volumen de inmediato. El objetivo es crear una base medible y confiable.

---

## 3. Invariantes

Durante esta fase se mantienen estas invariantes:

- No features nuevas.
- No backend.
- No API.
- No monetizacion.
- No dependencias nuevas.
- Mantener SSG/SEO actual como base.
- No tocar herramientas salvo auditoria/documentacion previa.
- No cambiar version.
- No preparar npm publish.
- No abrir V3.2.
- Mantener `npm run test:run` verde.
- Mantener `npm run build` verde.
- Mantener CI y branch protection activos.

Cualquier propuesta que rompa una invariante debe ir a una fase nueva y ser aprobada por separado.

---

## 4. Diagnostico inicial

Estado actual:

- Sitemap generado por build.
- SSG activo mediante `vite-react-ssg`.
- Search Console disponible como fuente de impresiones, CTR, consultas y paginas indexadas.
- Cloudflare Analytics disponible como fuente privacy-first de visitas, paginas de entrada y rendimiento agregado.
- CI verde y branch protection configurado.
- Trafico inicial bajo/medio segun contexto operativo.
- Rendimiento observado en auditorias recientes:
  - Tests verdes con 110 tests.
  - Build verde.
  - SSG renderiza 16 paginas.
  - Sitemap genera 14 URLs.

Lectura principal: la limitacion actual no parece ser arquitectura. El problema mas probable es baja visibilidad organica, senales iniciales limitadas y falta de datos suficientes para priorizar.

Por eso el plan debe enfocarse en claridad, indexabilidad, copy y confianza, no en features o infraestructura.

---

## 5. Acciones SEO base recomendadas

### A. Muy bajo riesgo

Estas acciones son las primeras candidatas porque no deberian alterar comportamiento funcional:

- Revisar titles por herramienta.
- Revisar meta descriptions.
- Mejorar copy por herramienta sin cambiar UI de fondo.
- Reforzar privacidad/procesamiento local en paginas de herramientas.
- Revisar headings para que cada pagina comunique la utilidad principal.
- Evitar claims exagerados como "mejor", "garantizado" o "100 % seguro".
- Revisar canonical por pagina.
- Revisar sitemap generado.
- Confirmar que paginas importantes aparecen en Search Console.
- Confirmar que el copy distingue entre procesamiento local y futuras APIs.
- Alinear nombres visibles con consultas reales: unir PDFs, dividir PDF, PDF a imagenes, extraer texto de PDF.

### B. Riesgo medio

Estas acciones pueden aportar mas crecimiento, pero requieren revisar arquitectura de contenido y SSG antes de implementar:

- Agregar paginas informativas estaticas.
- Crear landing "Privacidad y procesamiento local".
- Crear paginas guia por herramienta.
- Mejorar enlazado interno entre herramientas relacionadas.
- Crear contenido educativo corto para estudiantes/desarrolladores.
- Agregar secciones FAQ estaticas si encajan naturalmente con cada herramienta.

Estas acciones deben pasar primero por una auditoria SEO tecnica concreta del codigo existente para no romper rutas, canonical, sitemap o SSG.

### C. Postergar

Estas acciones deben postergarse:

- Blog grande.
- Muchas herramientas nuevas.
- npm publico.
- Backend/API.
- Monetizacion.
- Campanas pagas.
- Redisenos amplios.
- Automatizaciones de contenido sin criterio editorial.

Postergar no significa descartar. Significa esperar datos y mantener la estabilidad lograda en V3.

---

## 6. Paginas o contenidos candidatos

Ideas conservadoras de contenido:

- Como unir PDFs sin subir archivos.
- Como dividir un PDF en el navegador.
- Como extraer texto de un PDF localmente.
- Convertir imagenes a PDF sin subir archivos.
- Herramientas PDF privadas y locales.
- Que significa procesamiento local.
- Diferencia entre herramienta local y API.
- Por que algunos PDFs escaneados necesitan OCR.
- Como contar paginas de un PDF sin subirlo.
- Como convertir PDF a imagenes desde el navegador.

Enfoque editorial:

- Explicar el problema de forma simple.
- Mostrar que Modulaq procesa localmente cuando es posible.
- No prometer OCR si no existe.
- No prometer compresion real si no se garantiza.
- Evitar lenguaje comercial agresivo.
- Priorizar claridad, privacidad y utilidad.

---

## 7. Metricas a observar

Search Console:

- Impresiones.
- CTR.
- Consultas.
- Posicion media.
- Paginas indexadas.
- Paginas con impresiones pero bajo CTR.
- Consultas con posicion 8-30 que puedan mejorar con copy.

Cloudflare Analytics:

- Visitas por herramienta.
- Paginas con mayor entrada.
- Rutas con mayor permanencia relativa.
- P50/P75 page load.
- Pais/dispositivo/navegador agregado.
- Tendencia semanal.

Metricas internas de calidad:

- `npm run test:run` verde.
- `npm run build` verde.
- CI verde.
- Sitemap generado sin errores.
- Sin regresiones de rutas.

Decision clave: no optimizar una sola metrica aislada. Impresiones, CTR y visitas deben leerse juntas.

---

## 8. Plan de ejecucion recomendado

### Semana 1: auditoria SEO ligera y mejoras conservadoras

Objetivo: identificar cambios de muy bajo riesgo antes de tocar codigo.

Actividades:

- Auditar titles actuales.
- Auditar meta descriptions.
- Auditar headings por pagina.
- Auditar canonical.
- Auditar sitemap.
- Auditar copy de privacidad/procesamiento local.
- Identificar herramientas con mayor potencial organico.
- Proponer cambios concretos en un documento o PR separado.

Regla: no implementar hasta tener auditoria tecnica concreta del codigo existente.

### Semanas 2-4: observacion

Objetivo: dejar que Google y Analytics acumulen datos.

Actividades:

- Revisar Search Console semanalmente.
- Revisar Cloudflare Analytics semanalmente.
- Registrar consultas emergentes.
- Registrar paginas con impresiones.
- Registrar paginas con entradas reales.
- No agregar features nuevas.

### Semana 4: analisis de datos

Objetivo: decidir con evidencia.

Preguntas:

- Que herramientas tienen impresiones?
- Que consultas aparecen?
- Hay CTR bajo por title/description?
- Hay paginas indexadas que no reciben impresiones?
- Hay paginas con visitas pero sin conversion a uso?
- Hay problemas de rendimiento o indexacion?

Salida esperada:

- Lista priorizada de mejoras.
- Decision sobre si mantener Growth 1, abrir Growth 2 o evaluar V3.2.

### Despues: decidir V3.2 o Growth 2

Si los datos muestran que falta descubrimiento, continuar con Growth 2.

Si los datos muestran una necesidad tecnica real, recien ahi evaluar V3.2.

V3.2 no debe abrirse por ansiedad de roadmap. Debe abrirse por evidencia.

---

## 9. Que NO hacer todavia

No hacer todavia:

- Campanas pagas.
- Spam en comunidades.
- Redisenos.
- Backend.
- Features grandes.
- Monetizacion.
- npm publish.
- API publica.
- Login/cuentas.
- Blog grande sin estrategia.
- Nuevas herramientas solo para inflar catalogo.
- Cambios profundos de SSG sin auditoria.

Estas decisiones protegen la estabilidad tecnica y la promesa privacy-first.

---

## 10. Proximo paso recomendado

Despues de aprobar este plan, el siguiente paso recomendado es hacer una auditoria SEO tecnica concreta del codigo existente antes de implementar.

Esa auditoria deberia revisar:

- Donde se definen titles y descriptions.
- Como se generan canonical.
- Como se alimenta `PageHead`.
- Como se genera el sitemap.
- Que rutas estan incluidas/excluidas.
- Que metadata tiene cada herramienta.
- Que copy puede mejorarse sin cambiar comportamiento.
- Que cambios requieren test/build.

Solo despues de esa auditoria conviene implementar cambios SEO de bajo riesgo.

---

## 11. Criterio de exito

El plan Post-V3 SEO/Growth organico es exitoso si:

- Mejora la claridad publica sin romper estabilidad.
- Mantiene tests y build verdes.
- Aumenta impresiones organicas.
- Mejora CTR donde haya oportunidad.
- Genera datos suficientes para priorizar.
- Refuerza la confianza privacy-first.
- Evita abrir V3.2 prematuramente.

---

## 12. Recomendacion final

Recomendacion: aprobar este plan como fase Post-V3 Growth 1.

No implementar cambios todavia. Primero hacer la auditoria SEO tecnica concreta del codigo existente. Luego aplicar solo mejoras conservadoras, medir durante 2-4 semanas y decidir con datos si corresponde continuar con Growth 2 o abrir una fase tecnica nueva.
