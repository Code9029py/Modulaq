# Dividir imagen

Herramienta local para dividir una imagen en varias partes y descargarlas como ZIP.

## Comportamiento

- Acepta imagenes PNG, JPG/JPEG o WebP que el navegador pueda decodificar.
- Divide por filas/columnas o por tamano fijo de cada parte.
- En modo tamano fijo, calcula automaticamente filas y columnas.
- Si el borde derecho o inferior no calza exacto, genera una parte mas pequena.
- Exporta partes como PNG, JPG o WebP si el navegador lo soporta.
- Empaqueta las partes en un ZIP con nombres `parte-f1-c1.png`.
- Limite inicial: 100 partes.
- Todo el procesamiento ocurre en el navegador.
