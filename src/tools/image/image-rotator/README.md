# Rotar imagen

Herramienta frontend-only para rotar o voltear una imagen localmente en el navegador.

## Soporte

- Entrada: PNG, JPG/JPEG y WebP.
- Salida: PNG, JPG y WebP cuando el navegador puede exportarlo correctamente.
- Acciones combinables: rotar 90 grados a derecha o izquierda, rotar 180 grados, voltear horizontal y voltear vertical.

## Privacidad

El archivo se procesa en el navegador. No usa backend ni sube archivos.

## Notas tecnicas

Reutiliza `src/shared/utils/imageFiles.ts` para validacion de imagen, deteccion de WebP, nombres de salida, calidad, carga browser y exportacion de canvas.
