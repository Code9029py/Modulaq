# Comprimir PDF

Herramienta frontend-only que intenta reducir el tamaño de un PDF sin rasterizar sus páginas ni enviar el archivo a un servidor.

## Alcance inicial

- Acepta uno o varios PDFs y muestra nombre, tamaño, cantidad de páginas y estado por archivo.
- Reprocesa el documento con `pdf-lib` usando object streams.
- Compara tamaños originales y resultados generados, tanto por archivo como en el total.
- Descarga un PDF para una selección individual o un ZIP para varios resultados.
- Si la reserialización genera un archivo mayor, conserva los bytes originales para evitar empeorar la descarga.
- Informa claramente cuando la reducción es mínima o no se consigue una mejora real.

## Limitaciones

La reducción depende de cómo fue generado el PDF. Un archivo que ya está optimizado, o que contiene imágenes ya comprimidas, puede no reducirse de manera perceptible desde el navegador.

No incluye OCR, rasterización, recomprensión de imágenes ni procesamiento en backend.
