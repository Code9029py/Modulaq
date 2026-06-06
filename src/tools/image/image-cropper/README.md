# Recortar imagen

Herramienta frontend-only para recortar una imagen con valores numericos.

## Soporte

- Entrada: PNG, JPG/JPEG y WebP.
- Recorte por X, Y, ancho y alto.
- Accesos rapidos: imagen completa, centrar recorte actual y cuadrado centrado.
- Salida: PNG, JPG y WebP cuando el navegador puede exportarlo correctamente.

## Privacidad

El archivo se procesa en el navegador. No usa backend ni sube archivos.

## Notas tecnicas

Reutiliza `src/shared/utils/imageFiles.ts` para validacion de imagen, deteccion de WebP, nombres de salida, calidad, carga browser y exportacion de canvas.
