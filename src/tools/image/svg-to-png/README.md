# SVG a PNG

Herramienta local para convertir SVG simple a PNG desde el navegador.

## Alcance

- Permite subir un archivo `.svg` o pegar codigo SVG.
- Valida que exista una etiqueta `<svg>`.
- Rechaza SVG con `<script>`.
- Muestra dimensiones detectadas desde `width`/`height` o `viewBox`.
- Permite ajustar ancho, alto, fondo transparente o color de fondo.
- Exporta solo PNG.

## Limitaciones

- Algunos SVG con recursos externos pueden no procesarse o renderizar igual.
- No promete compatibilidad perfecta con todos los SVG.
- No usa backend ni sube archivos.
