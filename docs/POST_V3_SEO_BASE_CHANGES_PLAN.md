# Modulaq Post-V3 - Plan de cambios SEO base

> Documento de propuesta, no de implementacion.
> No modifica codigo, metadata real, SSG, herramientas, version, dependencias, npm publish ni abre V3.2.
> Basado en `docs/POST_V3_SEO_GROWTH_PLAN.md`, `docs/POST_V3_SEO_TECHNICAL_AUDIT.md` y una revision externa del plan inicial.

---

## 1. Resumen ejecutivo

Este plan propone una primera tanda concreta y acotada de mejoras SEO de bajo riesgo para Modulaq:

- Ajustes candidatos de titles y meta descriptions.
- Refuerzo visible de procesamiento local con lenguaje claro y acotado.
- Enlazado interno limitado entre herramientas realmente relacionadas.
- Wording honesto para `Comprimir PDF`.
- Baseline obligatorio en Search Console antes de implementar.
- Criterios simples de exito, revision y reversion.

Son cambios de bajo riesgo porque no agregan features, no cambian arquitectura, no tocan SSG de fondo, no introducen dependencias y no modifican el comportamiento de las herramientas. La mayoria son cambios de copy y metadata sobre paginas que ya existen.

Este plan evita tocar:

- Codigo funcional.
- Herramientas.
- Backend/API.
- Login/cuentas.
- Monetizacion.
- npm publish.
- Rediseño.
- Paginas guia nuevas por ahora.
- Landing nueva.
- V3.2.

---

## 2. Objetivo de la fase

Objetivos concretos:

- Mejorar descubrimiento organico.
- Reforzar procesamiento local con lenguaje claro en español.
- Mejorar intencion de busqueda en titles, descriptions y copy visible.
- Preparar mejores datos para Search Console.
- Mantener la estabilidad tecnica lograda en V3.
- Evitar que SEO implique scope creep de producto.

La meta de esta fase no es maximizar trafico a cualquier costo. Es hacer que Google y los usuarios entiendan mejor que Modulaq ofrece herramientas PDF, texto y QR que funcionan en el navegador, sin cuenta y con procesamiento local cuando aplica.

---

## 3. Baseline obligatorio antes de implementar

Antes de aplicar cualquier cambio SEO base, registrar una foto inicial en Search Console.

Datos minimos:

- Impresiones totales.
- CTR promedio.
- Consultas principales.
- URLs indexadas.
- Paginas con entrada organica.
- Paginas con impresiones pero bajo CTR.
- Consultas donde Modulaq aparezca en posiciones 8-30.

Periodo recomendado:

- Ultimos 28 dias si hay datos suficientes.
- Ultimos 7 dias solo si el sitio es muy nuevo y no hay mas volumen.

Objetivo del baseline:

- Evitar implementar a ciegas.
- Poder comparar 2-4 semanas despues del deploy.
- Detectar si un title/description mejora impresiones pero empeora CTR.
- Separar crecimiento real de fluctuaciones normales de indexacion.

---

## 4. Cambios propuestos en metadata

Los textos siguientes son candidatos. No implementar todavia.

### Home

Title actual:

```text
Modulaq - Microherramientas digitales modulares
```

Title candidato:

```text
Modulaq - Herramientas PDF, QR y texto en tu navegador
```

Description candidata revisada:

```text
Modulaq ofrece herramientas gratuitas para PDF, QR y texto. Funcionan en tu navegador, sin cuenta y sin subir tus archivos.
```

Razon: comunica categorias actuales, utilidad y simplicidad sin sonar defensivo.

### /herramientas

Title candidato:

```text
Herramientas PDF, QR y texto gratis
```

Description candidata:

```text
Explora herramientas gratuitas de Modulaq para PDF, QR y texto. Usa utilidades rapidas en tu navegador, sin cuenta y sin instalar nada.
```

Razon: reemplaza "productividad" por categorias mas concretas y buscables sin repetir demasiado "sin subir archivos".

### Herramientas PDF

La revision externa recomienda reducir el uso de "sin subir archivos" en titles. Mantenerlo solo donde aporta mas claridad: Unir PDFs, Dividir PDF, Imagen a PDF y Extraer texto de PDF.

#### Unir PDFs

Title candidato:

```text
Unir PDFs online gratis sin subir archivos
```

Description candidata:

```text
Combina varios PDFs en un solo documento y ordenalos como quieras. El procesamiento ocurre en tu navegador; no subimos tus archivos a Modulaq.
```

#### Dividir PDF

Title candidato:

```text
Dividir PDF online gratis sin subir archivos
```

Description candidata:

```text
Separa un PDF por rangos o paginas individuales y descarga el resultado. El procesamiento del archivo ocurre en tu navegador.
```

#### Reordenar paginas PDF

Title candidato:

```text
Reordenar paginas PDF online gratis
```

Description candidata:

```text
Cambia el orden de las paginas de un PDF y descarga el documento reorganizado. Funciona directamente en tu navegador.
```

#### Imagen a PDF

Title candidato:

```text
Convertir imagenes a PDF sin subir archivos
```

Description candidata:

```text
Convierte imagenes PNG, JPG o WebP en un PDF ordenado. Gratis, sin marcas de agua y con procesamiento en tu navegador.
```

#### PDF a imagenes

Title candidato:

```text
Convertir PDF a imagenes PNG online
```

Description candidata:

```text
Convierte paginas de un PDF en imagenes PNG descargables. El renderizado ocurre en tu navegador.
```

#### Extraer texto de PDF

Title candidato:

```text
Extraer texto de PDF online sin subir archivos
```

Description candidata:

```text
Extrae texto seleccionable de un PDF para copiarlo o descargarlo como TXT. El procesamiento ocurre en tu navegador.
```

#### Contador de paginas PDF

Title candidato:

```text
Contar paginas de un PDF online
```

Description candidata:

```text
Consulta cuantas paginas tiene un PDF al instante. La lectura del archivo ocurre en tu navegador.
```

#### Comprimir PDF

Mantener un title buscable:

```text
Comprimir PDF online gratis
```

Description candidata:

```text
Intenta optimizar un PDF directamente en tu navegador y muestra el resultado real. La reduccion depende del contenido del archivo.
```

Bloque visible recomendado arriba de la herramienta:

```text
Esta herramienta intenta optimizar la estructura del PDF en tu navegador. No recomprime imagenes ni garantiza reduccion. El resultado depende del contenido del archivo.
```

Regla editorial: no prometer compresion garantizada, "maxima compresion", "siempre reduce" ni "sin perder calidad".

### Limpiador de texto

Priorizar utilidad. No forzar privacidad si suena artificial.

Title candidato:

```text
Limpiar y normalizar texto gratis
```

Description candidata:

```text
Limpia espacios, saltos de linea, comillas raras y caracteres invisibles. Gratis, sin instalar nada.
```

### Generador QR

Priorizar utilidad. No forzar privacidad si suena artificial.

Title candidato:

```text
Generador de codigos QR gratis
```

Description candidata:

```text
Genera codigos QR para enlaces, texto, email o telefono. Descarga en PNG, sin cuenta.
```

---

## 5. Cambios propuestos en copy visible

La revision externa recomienda evitar afirmaciones absolutas como "no enviamos datos a servidores" y usar wording acotado a la operacion concreta.

### Frases base recomendadas

```text
El procesamiento de este archivo ocurre en tu navegador; no lo subimos a Modulaq.
```

```text
Funciona en tu navegador, sin cuenta y sin instalar nada.
```

```text
Procesamiento local para esta herramienta.
```

```text
El resultado depende del contenido y la estructura del archivo.
```

### Frases a usar con cuidado o evitar

Evitar como copy publico repetido:

```text
privacy-first
```

```text
No enviamos datos a servidores.
```

```text
100 % seguro.
```

```text
Garantizado.
```

Razon: el mensaje debe ser claro, especifico y honesto. En español, "el procesamiento ocurre en tu navegador; no lo subimos a Modulaq" es mas entendible que una etiqueta generica.

### Zonas recomendadas

#### Cerca del H1

Para herramientas PDF con archivo:

```text
El procesamiento de este archivo ocurre en tu navegador; no lo subimos a Modulaq.
```

Para `Comprimir PDF`:

```text
Esta herramienta intenta optimizar la estructura del PDF en tu navegador. No recomprime imagenes ni garantiza reduccion. El resultado depende del contenido del archivo.
```

Para `Limpiador de texto`:

```text
Pega texto, ajusta opciones y obten una version mas limpia al instante.
```

Para `Generador QR`:

```text
Crea codigos QR para enlaces, texto, email o telefono y descargalos como PNG.
```

#### Descripcion inicial

Usar una frase natural solo cuando aporte:

```text
Funciona directamente en tu navegador.
```

```text
Pensado para tareas rapidas con documentos.
```

#### Bloques de confianza

Mantener bloques cortos y no repetirlos en exceso:

```text
En tu navegador
El archivo se procesa localmente durante esta operacion.
```

```text
Sin cuenta
Usa las herramientas publicas sin registro ni inicio de sesion.
```

```text
Transparente
Indicamos limites y casos donde el resultado depende del archivo.
```

#### Documentacion de herramienta

Refuerzo candidato para seccion "Privacidad" de herramientas con archivos:

```text
El procesamiento de este archivo ocurre en tu navegador; no lo subimos a Modulaq para realizar esta operacion.
```

Para `Comprimir PDF`:

```text
La optimizacion se intenta localmente en tu navegador. No recomprime imagenes ni garantiza reduccion; el resultado depende de la estructura del PDF y de si ya esta optimizado.
```

---

## 6. Enlazado interno recomendado

Agregar enlaces contextuales solo si encajan de forma limpia en paginas de herramientas o en una seccion pequeña de "Herramientas relacionadas".

### Aprobar primero

- Unir PDFs <-> Dividir PDF.
- Dividir PDF <-> Reordenar paginas PDF.
- Reordenar paginas PDF <-> Unir PDFs.
- Imagen a PDF -> Unir PDFs.

Razon: son relaciones directas de organizacion de documentos. Un usuario que convierte imagenes a PDF puede querer combinar ese PDF con otros documentos.

### Postergar

- PDF a imagenes <-> Extraer texto de PDF.
- Demasiados enlaces desde Contador de paginas PDF.
- Enlaces repetidos a Privacidad en cada herramienta.

Razon: pueden ser utiles, pero corren mas riesgo de sentirse artificiales o repetitivos. Conviene medir primero y agregar despues si hay necesidad.

### Texto candidato para bloque de relacionados

```text
Herramientas relacionadas
```

```text
Tambien puede servirte para organizar tu documento:
```

Mantener 2-3 enlaces maximo por herramienta en esta fase.

---

## 7. Cambios que NO se recomiendan todavia

No recomendar en esta fase:

- Paginas guia.
- Blog.
- Landing nueva.
- OG por herramienta.
- `hreflang`.
- Rediseño.
- Nuevas herramientas.
- Backend/API.
- npm publish.
- Monetizacion.
- Campañas pagas.
- Automatizacion masiva de contenido.
- Cambios profundos de SSG.
- Reestructurar rutas existentes.
- V3.2.

Estas ideas pueden volver luego, con datos de Search Console y Cloudflare Analytics.

---

## 8. Nuevas oportunidades tecnicas post-copy

Estas oportunidades quedan como segunda tanda, no como primera implementacion:

- Agregar `lastmod` al sitemap.
- Evaluar JSON-LD `WebSite`.
- Evaluar JSON-LD `SoftwareApplication` para herramientas si encaja naturalmente.
- Evaluar coverage/medicion posterior para cambios SEO.
- Evaluar una forma liviana de comparar CTR por pagina antes/despues.

No implementar todavia. Primero aplicar copy/metadata/enlaces de bajo riesgo y medir.

---

## 9. Priorizacion

### Implementar primero

- Registrar baseline obligatorio en Search Console.
- Ajustar Home description con la version revisada.
- Ajustar `/herramientas` title/description.
- Ajustar metadata de herramientas PDF clave.
- Mantener "sin subir archivos" solo en:
  - Unir PDFs.
  - Dividir PDF.
  - Imagen a PDF.
  - Extraer texto de PDF.
- Ajustar `Comprimir PDF` con title buscable y bloque visible honesto.
- Quitar privacidad forzada de Limpiador y QR si no aporta.

### Implementar despues

- Enlaces internos aprobados primero.
- Bloques pequeños de confianza en herramientas PDF si no sobrecargan la UI.
- Ajustes menores en documentacion de herramienta para consistencia.
- Medicion posterior en Search Console.

### Postergar

- Paginas guia.
- Landing dedicada de privacidad/procesamiento local.
- FAQs por herramienta.
- Blog.
- OG por herramienta.
- `hreflang`.
- Cambios de arquitectura.
- V3.2.
- Backend/API/npm/monetizacion.

---

## 10. Riesgos

Riesgos a controlar:

- Titles demasiado largos.
- Keyword stuffing.
- Repetir "sin subir archivos" hasta que pierda naturalidad.
- Prometer demasiado en `Comprimir PDF`.
- Duplicar contenido entre herramientas.
- Afectar UX con demasiados bloques informativos.
- Sobrecargar la parte superior de la herramienta.
- Convertir el lenguaje de privacidad en claims absolutos.
- Enlazar herramientas sin contexto real.

Mitigacion:

- Mantener frases breves.
- Usar una sola promesa principal por zona.
- Evitar "100 % seguro", "garantizado" o "mejor".
- Evitar afirmaciones absolutas sobre servidores.
- Mantener el foco en utilidad, claridad y transparencia.
- Ejecutar tests/build despues de implementar.

---

## 11. Criterios de exito, revision y reversion

### Exito

Considerar la tanda exitosa si en 2-4 semanas se observa al menos una de estas señales:

- Mas impresiones organicas en paginas modificadas.
- Mejor CTR en paginas modificadas.
- Nuevas consultas relevantes en Search Console.
- Mas paginas con entrada organica.
- Mejor alineacion entre consultas y herramienta correspondiente.

### Revision

Revisar si:

- Baja el CTR en paginas modificadas.
- Suben impresiones pero los clics no acompañan.
- Aparecen consultas irrelevantes por wording demasiado amplio.
- Los usuarios entran pero rebotan rapido segun Cloudflare Analytics.

### Reversion

Revertir o ajustar si:

- Un title/description empeora visiblemente la pagina en Search Console.
- El copy visible empeora la claridad o sobrecarga la UI.
- `Comprimir PDF` empieza a atraer expectativas incorrectas.
- Un enlace interno se siente artificial o reduce claridad.

---

## 12. Checklist de implementacion futura

Usar este checklist solo cuando se apruebe implementar:

- [ ] Registrar baseline en Search Console.
- [ ] Registrar impresiones.
- [ ] Registrar CTR.
- [ ] Registrar consultas.
- [ ] Registrar URLs indexadas.
- [ ] Registrar paginas con entrada organica.
- [ ] Cambiar metadata candidata seleccionada.
- [ ] Cambiar copy visible de bajo riesgo.
- [ ] Agregar solo enlaces internos aprobados primero.
- [ ] Verificar que `Comprimir PDF` mantenga wording honesto.
- [ ] Revisar manualmente que no haya titles demasiado largos.
- [ ] Revisar que no haya keyword stuffing.
- [ ] Ejecutar `npm run test:run`.
- [ ] Ejecutar `npm run build`.
- [ ] Revisar sitemap generado.
- [ ] Revisar paginas renderizadas principales.
- [ ] Deploy.
- [ ] Revisar Search Console tras deploy.
- [ ] Revisar Cloudflare Analytics tras deploy.
- [ ] Esperar 2-4 semanas antes de decidir nuevas acciones.
- [ ] Comparar contra baseline.
- [ ] Decidir mantener, ajustar o revertir.

---

## 13. Material para segunda opinion externa

Antes de implementar, se puede pedir una segunda opinion a otra IA o reviewer SEO.

Documentos a pasar:

- `docs/MODULAQ_V3_CONTEXT.md`
- `docs/POST_V3_SEO_GROWTH_PLAN.md`
- `docs/POST_V3_SEO_TECHNICAL_AUDIT.md`
- `docs/POST_V3_SEO_BASE_CHANGES_PLAN.md`

Preguntas sugeridas:

1. Los titles candidatos son claros sin ser demasiado largos?
2. La reduccion de "sin subir archivos" en titles quedo natural?
3. Las meta descriptions comunican procesamiento local sin sonar repetitivas?
4. El wording de `Comprimir PDF` evita prometer compresion real garantizada?
5. Hay riesgo de keyword stuffing en las propuestas?
6. Que cambios implementarias primero si solo hubiera tiempo para 3?
7. Que cambios postergarias hasta tener datos de Search Console?
8. La estrategia mantiene bien el limite de no abrir V3.2?
9. El enlazado interno propuesto ayuda al usuario o parece artificial?
10. Falta alguna consulta long-tail importante que no requiera crear paginas nuevas todavia?

---

## 14. Recomendacion final

Recomendacion: el plan ya esta suficientemente maduro para implementar una tanda SEO base pequeña, siempre que primero se registre el baseline obligatorio en Search Console.

Implementar primero metadata/copy visible de bajo riesgo, con el wording revisado. Despues agregar enlaces internos solo para las relaciones aprobadas. Luego ejecutar tests/build, desplegar y observar Search Console durante 2-4 semanas antes de decidir paginas guia, Growth 2 o una fase tecnica nueva.

No abrir V3.2. No tocar backend/API/monetizacion/npm publish. No crear paginas guia, blog, landing nueva, OG por herramienta ni `hreflang` en esta tanda.
