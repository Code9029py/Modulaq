# Test fixtures de @modulaq/core

Binarios pequeños usados por la suite de tests del SDK.

## Regenerar

```
node packages/core/test-fixtures/generate.mjs
```

El script usa `pdf-lib` (ya dep del proyecto) y bytes hardcodeados de imágenes.
No descarga nada de internet. Reproducible.

## Inventario

| Archivo | Tamaño aprox. | Para qué |
|---|---|---|
| `pdf/text-simple-1p.pdf` | ~850 B | `countPdfPages`, `imagesToPdf` reference |
| `pdf/text-multi-3p.pdf` | ~1.2 KB | `mergePdfs`, `reorderPdfPages` |
| `pdf/text-multi-5p.pdf` | ~1.6 KB | `splitPdfRange`, `extractPdfPages` |
| `images/tiny.png` | 68 B | `imagesToPdf` (PNG) |
| `images/tiny.jpg` | ~630 B | `imagesToPdf` (JPG) |

**Total: ~4.4 KB.** Cap de la estrategia: < 100 KB.

## Política

- Los binarios **se commitean** al repo (no se generan en CI).
- Si una dep cambia (pdf-lib mayor) y rompe una fixture, regenerar con el script
  y los tests detectan la regresión.
- No agregar fixtures grandes ni reales; preferir mínimas y construidas.
