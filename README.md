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

## Estado de las herramientas

- Las 10 herramientas están disponibles en modo online.
- **Documentación:** disponible e indexable (SSG) en las 10 herramientas.
- **Código integrable:** disponible en 9 de las 10 herramientas. Comprimir PDF se mantiene sin código integrable a propósito, para no sugerir una compresión real que la herramienta no realiza.
- **API:** se muestra como capacidad futura, todavía no activa.
- **Favoritos e historial local:** el catálogo permite marcar favoritos y la Home muestra herramientas usadas recientemente, usando solo `localStorage` (sin cuenta ni backend).
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

## Analytics (V2.5)

Modulaq usa **Cloudflare Web Analytics**, una solución de métricas liviana y *privacy-first*.

- **Activación:** se habilita desde el dashboard de Cloudflare → proyecto de Pages → *Web Analytics*. Cloudflare inyecta el beacon automáticamente en el edge: **no requiere cambios de código**, ni dependencias, ni variables de entorno, y no afecta el SSG.
- **Qué se mide:** vistas y visitas por ruta (de ahí, las herramientas más visitadas en `/herramientas/<slug>`), tráfico general (referrers, país, dispositivo, navegador) y Core Web Vitals (LCP, INP, CLS). Todo agregado, sin perfiles de usuario.
- **Qué NO se mide:** datos personales, archivos cargados, nombres de archivos, contenido de PDFs/textos, emails ni mensajes de consultas. Cloudflare Web Analytics solo observa la URL y métricas de rendimiento; el contenido de las herramientas nunca sale del navegador.
- **Privacidad:** sin cookies, sin fingerprinting y sin almacenamiento en el cliente. No requiere banner de consentimiento.
- **Costo:** 0 (incluido en Cloudflare).
- **Eventos personalizados:** no se miden todavía. Cloudflare Web Analytics no soporta eventos arbitrarios; quedan planificados para una futura **V2.5B** (por ejemplo con Cloudflare Workers + Analytics Engine u otra solución *first-party*).
