# Convertir imagen

Herramienta frontend-only para convertir una imagen entre formatos compatibles con el navegador.

## Alcance inicial

- Carga de una imagen PNG, JPG/JPEG o WebP.
- Lectura local de nombre, tipo, peso y dimensiones.
- Exportacion a PNG o JPG.
- Exportacion a WebP solo si el navegador permite generarla correctamente.
- Control de calidad para JPG y WebP.
- Advertencia cuando una salida JPG puede perder transparencia.
- Descarga de la imagen convertida con extension y MIME correctos.

## Privacidad

La imagen se carga, decodifica y convierte localmente en el navegador mediante canvas. No se usa backend.

## Pendiente

- Validacion visual manual en navegadores reales.
- Deteccion precisa de canal alpha si se justifica.
- Formatos adicionales solo si existe soporte estable y medible.
