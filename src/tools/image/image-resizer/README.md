# Redimensionar imagen

Herramienta frontend-only para cambiar dimensiones de una imagen localmente en el navegador.

## Alcance inicial

- Carga de una imagen PNG, JPG/JPEG o WebP.
- Lectura local de nombre, tipo, peso y dimensiones.
- Cambio por ancho, alto o porcentaje.
- Mantener proporcion activado por defecto.
- Salida PNG, JPG o WebP cuando el navegador lo soporta.
- Calidad configurable para JPG y WebP.
- Resultado con dimensiones finales, formato final, peso final y diferencia de peso.
- Descarga con extension y MIME correctos.

## Limites

- Maximo: 8000 px por lado.
- Maximo: 64 megapixeles por salida.
- Dimensiones muy grandes pueden consumir mas memoria del navegador.

## Privacidad

La imagen se decodifica, redimensiona y exporta localmente mediante canvas. No se usa backend.
