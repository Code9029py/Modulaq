# Imagen a Base64 / Base64 a imagen

Modulo frontend-only con dos herramientas publicas separadas y un service compartido:

- Imagen a Base64.
- Base64 a imagen.

## Alcance inicial

- UI independiente para cada direccion.
- Base64 puro y Data URL completa.
- Copia de Base64 y Data URL.
- Descarga TXT del resultado textual.
- Reconstruccion de imagen desde Base64 puro o Data URL.
- Descarga de imagen reconstruida con MIME y extension correctos.

## Privacidad

La lectura, codificacion y reconstruccion se realizan localmente en el navegador. No se usa backend.

## Arquitectura

- `ImageToBase64Tool.tsx`: flujo archivo imagen a Base64/Data URL.
- `Base64ToImageTool.tsx`: flujo Base64/Data URL a imagen descargable.
- `imageBase64.service.ts`: parseo, validacion, nombres de salida y conversiones compartidas.

## Limitaciones

- Base64 suele ocupar mas que el archivo binario original.
- No comprime ni optimiza imagenes.
- Base64 puro requiere seleccionar el tipo de imagen esperado.
- Una cadena Base64 valida puede no representar una imagen previsualizable.
