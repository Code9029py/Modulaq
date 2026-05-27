# Dividir PDF

Herramienta frontend-only para dividir un PDF y descargar los resultados sin enviar archivos a servidores.

## Modos

### Extraer paginas

Usa este modo si solo necesitas guardar algunas paginas del PDF. Acepta selecciones como `2-4`, `1,3,5` o `1,3-5,7` y genera un unico PDF. Las paginas repetidas se incluyen una sola vez y se respeta el orden escrito.

### Dividir por partes

Usa este modo si queres partir todo el documento en varios PDFs. Cada parte acepta paginas individuales y rangos mixtos, por ejemplo `1,5-7`. Todas las paginas deben quedar asignadas una sola vez, sin duplicados ni partes vacias. El resultado se descarga como ZIP.

### Separar todas

Usa este modo si queres generar un archivo PDF individual por cada pagina. El resultado se descarga como ZIP.

## Procesamiento

Los archivos se procesan localmente en el navegador. No se suben a servidores. La herramienta utiliza `pdf-lib` para crear PDFs y `jszip` para las descargas multiples.

Si el nombre de salida se deja vacio, la descarga usa el nombre original del PDF seguido de `-dividido`. Los caracteres no validos para nombres de archivo se sanitizan localmente.

## Pendiente

- Vista previa visual de paginas.
- Seleccion grafica.
- Opciones avanzadas de descarga.
