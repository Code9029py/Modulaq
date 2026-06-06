# Unir imagenes

Herramienta local para unir varias imagenes en una sola imagen final.

## Comportamiento

- Acepta imagenes PNG, JPG/JPEG o WebP que el navegador pueda decodificar.
- Permite reordenar, subir, bajar y eliminar imagenes.
- Modos de union: vertical, horizontal y cuadrícula.
- La cuadrícula usa un numero configurable de columnas y calcula las filas automaticamente.
- Permite ajustar separacion, padding exterior y color de fondo.
- Exporta PNG, JPG o WebP si el navegador lo soporta.
- JPG no conserva transparencia.
- Todo el procesamiento ocurre en el navegador.

## Layout

Las imagenes se dibujan en sus dimensiones originales. Vertical y horizontal centran cada imagen en el eje secundario. La cuadrícula usa celdas uniformes basadas en la imagen mas grande para mantener una composicion simple y predecible.
