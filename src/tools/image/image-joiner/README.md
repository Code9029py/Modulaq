# Unir imágenes

Herramienta local para unir varias imágenes en una sola imagen final.

## Comportamiento

- Acepta imágenes PNG, JPG/JPEG o WebP que el navegador pueda decodificar.
- Permite reordenar, subir, bajar y eliminar imágenes.
- Modos de unión: vertical, horizontal y cuadrícula.
- La cuadrícula usa un número configurable de columnas y calcula las filas automáticamente.
- Permite ajustar separación, padding exterior y color de fondo.
- Exporta PNG, JPG o WebP si el navegador lo soporta.
- Todo el procesamiento ocurre en el navegador.

## Layout

Las imágenes se dibujan en sus dimensiones originales. Vertical y horizontal centran cada imagen en el eje secundario. La cuadrícula usa celdas uniformes basadas en la imagen más grande para mantener una composición simple y predecible.
