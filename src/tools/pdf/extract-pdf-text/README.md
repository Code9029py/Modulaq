# Extraer texto de PDF

Herramienta frontend-only que obtiene texto seleccionable de un archivo PDF y permite copiarlo o descargarlo como TXT.

## Alcance inicial

- Acepta un único PDF y detecta su cantidad de páginas.
- Lee el texto de cada página con `pdfjs-dist`.
- Reconstruye líneas de forma aproximada usando las coordenadas de texto de PDF.js, con opción para obtener texto continuo.
- Muestra progreso durante la extracción.
- Advierte cuando no se detecta texto seleccionable o aparecen símbolos privados frecuentes en fórmulas complejas.
- Permite copiar el resultado o descargarlo como `.txt`.

## Implementación

`extractPdfText.service.ts` configura el worker de PDF.js mediante el recurso Vite `pdf.worker.min.mjs?url`, para mantener API y worker en la misma versión instalada. El documento nunca se envía a un servidor.

## Fuera de alcance

- OCR para documentos escaneados.
- Previsualización o edición del PDF.
- Procesamiento en backend.
