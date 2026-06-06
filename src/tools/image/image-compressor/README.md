# Comprimir imagen

Herramienta frontend-only para intentar reducir el peso de una imagen ajustando formato y calidad.

## Alcance inicial

- Carga de una imagen PNG, JPG/JPEG o WebP.
- Lectura local de nombre, tipo, peso y dimensiones.
- Salida JPG, PNG o WebP cuando el navegador lo soporta.
- WebP es el formato por defecto si el navegador puede exportarlo; si no, JPG.
- Control de calidad para JPG y WebP.
- Resultado con peso original, peso final, diferencia y porcentaje.
- Aviso claro si el archivo final pesa mas que el original.
- Advertencia cuando JPG puede perder transparencia.

## Privacidad

La imagen se carga, decodifica y exporta localmente en el navegador mediante canvas. No se usa backend.

## Limitaciones

- No promete reduccion garantizada.
- No redimensiona imagenes; redimensionar sera otra herramienta.
- PNG puede mantener nitidez/transparencia, pero no siempre reduce el tamano.
- La salida WebP depende del soporte real del navegador.
