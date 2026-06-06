# PDF a imagenes

Herramienta frontend-only para convertir paginas de un PDF en imagenes PNG o JPG descargables.

## Alcance V1

- Carga de un unico archivo PDF.
- Lectura local del numero de paginas.
- Conversion de todas las paginas o de un rango simple.
- Renderizado de cada pagina a PNG o JPG mediante `pdfjs-dist`.
- Selector de formato: PNG por defecto o JPG con calidad configurable.
- Descarga directa de imagen cuando se convierte una pagina.
- Descarga ZIP mediante `jszip` cuando se convierten varias paginas.
- Progreso simple por pagina y errores amigables.

## Implementacion

`pdfjs-dist` renderiza paginas en canvas dentro del navegador y su worker se importa desde la misma version instalada como asset de Vite mediante `?url`. No se utiliza backend.

PNG prioriza nitidez y puede pesar mas. JPG permite ajustar calidad y suele generar archivos mas livianos. El procesamiento se realiza localmente en el navegador.

## Pendiente

- Vista previa avanzada de paginas.
- Formatos de imagen adicionales como WebP, si se justifica y se detecta soporte del navegador.
- Codigo integrable, API y documentacion publica extendida.
