# Imagen Base64

Herramienta frontend-only para convertir una imagen a Base64 y reconstruir una imagen desde Base64 o Data URL.

## Alcance inicial

- Modo Imagen a Base64.
- Modo Base64 a imagen.
- Base64 puro y Data URL completa.
- Copia de Base64 y Data URL.
- Descarga TXT del resultado textual.
- Reconstruccion de imagen desde Base64 puro o Data URL.
- Descarga de imagen reconstruida con MIME y extension correctos.

## Privacidad

La lectura, codificacion y reconstruccion se realizan localmente en el navegador. No se usa backend.

## Limitaciones

- Base64 suele ocupar mas que el archivo binario original.
- No comprime ni optimiza imagenes.
- Base64 puro requiere seleccionar el tipo de imagen esperado.
- Una cadena Base64 valida puede no representar una imagen previsualizable.
