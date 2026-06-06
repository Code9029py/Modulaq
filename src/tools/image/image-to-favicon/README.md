# Imagen a favicon

Herramienta local para generar un pack ZIP de iconos PNG para favicon, Apple touch icon y PWA.

## Comportamiento

- Acepta imagenes PNG, JPG/JPEG o WebP que el navegador pueda decodificar.
- Genera PNG cuadrados en 16x16, 32x32, 48x48, 180x180, 192x192 y 512x512.
- Usa ajuste `cover` centrado para que el icono llene el cuadrado.
- Descarga un ZIP con nombres fijos y un `README.txt` con ejemplos HTML.
- No genera archivo `.ico` clasico.
- Todo el procesamiento ocurre en el navegador.

## Archivos del ZIP

- `favicon-16x16.png`
- `favicon-32x32.png`
- `favicon-48x48.png`
- `apple-touch-icon.png`
- `icon-192.png`
- `icon-512.png`
- `README.txt`
