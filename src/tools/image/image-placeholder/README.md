# Generar imagen placeholder

Herramienta local para generar una imagen placeholder simple para disenos, pruebas o desarrollo web.

## Comportamiento

- Configura ancho, alto, texto opcional, color de fondo y color de texto.
- Actualiza el texto por defecto cuando cambian las dimensiones, salvo que el usuario haya escrito texto personalizado.
- Exporta PNG, JPG o WebP si el navegador lo soporta.
- Usa canvas y descarga la imagen generada localmente.
- No usa backend ni dependencias nuevas.

## Limites

- Maximo 8000 px por lado.
- Maximo 64 megapixeles.
- No es un editor avanzado: genera una composicion simple con texto centrado.
