# Extraer colores de imagen

Herramienta local para extraer una paleta aproximada de colores dominantes desde una imagen.

## Comportamiento

- Acepta imagenes PNG, JPG/JPEG o WebP que el navegador pueda decodificar.
- Analiza la imagen con canvas en el navegador.
- Usa muestreo de hasta 50.000 pixeles.
- Agrupa colores por cuantizacion RGB simple.
- Ignora pixeles totalmente transparentes.
- Permite exportar la paleta como TXT o JSON.
- Todo el procesamiento ocurre en el navegador.

## Limites

La paleta es una estimacion basada en muestreo y buckets de color. No promete una paleta exacta ni usa IA/backend.
