# PDF a imagenes

Herramienta frontend-only para convertir paginas de un PDF en imagenes PNG descargables.

## Alcance V1

- Carga de un unico archivo PDF.
- Lectura local del numero de paginas.
- Conversion de todas las paginas o de un rango simple.
- Renderizado de cada pagina a PNG mediante `pdfjs-dist`.
- Descarga directa de PNG cuando se convierte una pagina.
- Descarga ZIP mediante `jszip` cuando se convierten varias paginas.
- Progreso simple por pagina y errores amigables.

## Implementacion

`pdfjs-dist` renderiza paginas en canvas dentro del navegador y su worker se importa desde la misma version instalada como asset de Vite mediante `?url`. No se utiliza backend.

## Pendiente

- Vista previa avanzada de paginas.
- Formatos de imagen adicionales.
- Codigo integrable, API y documentacion publica extendida.
