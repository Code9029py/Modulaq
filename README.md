# Modulaq V1.1

Modulaq es una plataforma frontend-only de microherramientas modulares. Las herramientas se ejecutan localmente en el navegador y no requieren backend para las funciones disponibles en V1.1.

## Stack

- React
- Vite
- TypeScript
- TailwindCSS

## Desarrollo local

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Formulario de contacto

La página `/consultas` puede enviar mensajes directamente mediante Web3Forms, sin backend propio. Para habilitarlo en desarrollo local, crea un archivo `.env.local` a partir de `.env.example`:

```bash
VITE_WEB3FORMS_ACCESS_KEY=tu_access_key_de_web3forms
```

En Cloudflare Pages, configura `VITE_WEB3FORMS_ACCESS_KEY` como variable de entorno del build. Si la variable no está definida, el formulario continúa funcionando mediante `mailto:contacto@modulaq.dev`.

## Herramientas disponibles

- Limpiador de texto
- Generador de QR
- Contador de páginas PDF
- Imagen a PDF
- Unir PDFs
- Dividir PDF
- Reordenar páginas PDF
- PDF a imágenes
- Extraer texto de PDF
- Comprimir PDF

## Estado de V1.1

- Las 10 herramientas están disponibles en modo online.
- Código integrable, API y documentación se muestran como capacidades planificadas, todavía no activas.
- Los renderers de herramientas se cargan bajo demanda para mantener ligera la navegación inicial.

## SEO y renderizado (V2.1)

- El build hace prerender/SSG de cada ruta con `vite-react-ssg`: genera HTML estático por página (incluida una por herramienta) que luego hidrata como SPA.
- Cada ruta define su `<head>` (title, description, canonical, Open Graph/Twitter) mediante `PageHead` (`src/shared/seo/PageHead.tsx`), alimentado por la metadata de la herramienta (`tool.seo` opcional).
- Las herramientas interactivas se renderizan dentro de `ClientOnly`, por lo que no se ejecutan en el server (evita dependencias de navegador como pdf.js en el prerender).
- `scripts/generate-sitemap.mjs` genera `dist/sitemap.xml` con las URLs canónicas tras el build. `public/robots.txt` apunta a él.
- `/contacto` y `/solicitar-herramienta` canonicalizan a `/consultas` (se excluyen del sitemap). `/catalogo` redirige 301 a `/herramientas` vía `public/_redirects`.

## Procesamiento local y límites

Los archivos se procesan en el navegador. Para reducir bloqueos en operaciones intensivas, la interfaz aplica límites preventivos cuando corresponde:

- PDF individual: hasta 50 MB.
- Selecciones de múltiples PDFs: hasta 100 MB en total.
- Imagen individual: hasta 15 MB.
- Conversión Imagen a PDF: hasta 30 imágenes y 100 MB en total.
- Procesos de páginas intensivos, como PDF a imágenes y Separar todas: hasta 50 páginas por operación.

## Deploy en Cloudflare Pages

Configuración recomendada:

- Comando de build: `npm run build`
- Directorio de salida: `dist`

El proyecto usa `BrowserRouter`. El archivo `public/_redirects` incluye el fallback SPA necesario para que rutas directas como `/herramientas/comprimir-pdf` resuelvan a `index.html` en Cloudflare Pages.
