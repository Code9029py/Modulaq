# Unir PDFs

Herramienta frontend-only para combinar varios archivos PDF en un único PDF descargable.

## Alcance V1

- Carga múltiple de archivos PDF.
- Validación local de tipo de archivo.
- Lectura local de cantidad de páginas con `pdf-lib` cuando el PDF lo permite.
- Lista con nombre, tamaño, páginas detectadas y errores por archivo.
- Reordenamiento manual con controles Subir/Bajar.
- Eliminación individual y limpieza completa.
- Unión local en el orden mostrado.
- Nombre de descarga editable, sanitizado y con extensión `.pdf` automática.
- Errores amigables para archivos no PDF, corruptos, protegidos o no procesables.

## Pendiente

- Código integrable.
- API.
- Documentación pública extendida.
