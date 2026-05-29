import type { ToolMetadata, ToolModeId } from "../types/tool.types";

const v11AvailableModes = ["online"] as const satisfies readonly ToolModeId[];
const v11PlannedModes = ["integrable-code", "api", "documentation"] as const satisfies readonly ToolModeId[];

export const tools: ToolMetadata[] = [
  {
    id: "merge-pdf",
    name: "Unir PDFs",
    slug: "unir-pdfs",
    description: "Combina varios archivos PDF en un único documento ordenado.",
    category: "pdf",
    tags: ["pdf", "documentos", "combinar", "archivos"],
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      title: "Unir PDFs online gratis",
      description:
        "Combiná varios PDF en un solo documento, en el orden que quieras. Gratis, sin instalar nada y procesado en tu navegador: tus archivos no se suben.",
    },
    doc: {
      summary:
        "Unir PDFs combina dos o más archivos PDF en un único documento, respetando el orden que definas.",
      howTo: [
        "Agregá dos o más archivos PDF.",
        "Reordená la lista con subir/bajar o quitá los que no quieras incluir.",
        "Opcional: editá el nombre del archivo de salida.",
        "Descargá el PDF combinado.",
      ],
      useCases: [
        "Juntar documentos relacionados, como una factura y su comprobante.",
        "Combinar capítulos o secciones en un solo archivo.",
        "Consolidar varios escaneos en un único PDF para enviar.",
      ],
      limits: [
        "Se necesitan al menos dos PDF para unir.",
        "Cada archivo admite hasta 50 MB y el conjunto, hasta 100 MB en total.",
      ],
      privacy:
        "Los PDF se combinan en tu navegador. Los archivos no se suben a ningún servidor de Modulaq.",
      commonErrors: [
        "Algún archivo no es un PDF válido.",
        "Un PDF protegido o dañado puede no poder leerse para unirse.",
      ],
      technicalNotes: [
        "El procesamiento usa pdf-lib en el navegador.",
        "El documento final respeta el orden mostrado en la lista.",
      ],
    },
    integrableCode: {
      summary:
        "Unir PDFs corre 100% en el navegador con pdf-lib: copiás las páginas de cada documento a uno nuevo. Instalá pdf-lib y reutilizá esta función.",
      snippets: [
        {
          id: "merge-pdf-core",
          title: "Unir varios PDFs en uno",
          description: "Recibe un array de File en orden y devuelve los bytes del PDF combinado.",
          language: "typescript",
          code: `import { PDFDocument } from "pdf-lib";

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();

  for (const file of files) {
    const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  return merged.save();
}`,
          dependencies: ["pdf-lib"],
          usageNotes: [
            "El orden del array es el orden final de las páginas.",
            "Para descargar, envolvé los bytes en un Blob de tipo application/pdf y usá URL.createObjectURL.",
          ],
          limitations: [
            "Necesita al menos dos PDFs para que tenga sentido.",
            "Un PDF protegido o encriptado puede no cargar; ignoreEncryption ayuda solo en algunos casos.",
            "No combina formularios ni firmas digitales de forma especial.",
          ],
        },
      ],
    },
  },
  {
    id: "split-pdf",
    name: "Dividir PDF",
    slug: "dividir-pdf",
    description: "Separa un PDF en rangos o páginas individuales.",
    category: "pdf",
    tags: ["pdf", "separar", "paginas", "documentos"],
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      title: "Dividir PDF online gratis",
      description:
        "Separá un PDF por rangos o páginas individuales (1-3,5,8-10) y descargá el resultado. Gratis, sin instalar y 100% en tu navegador.",
    },
    doc: {
      summary:
        "Dividir PDF separa un documento en partes: podés extraer un rango de páginas, dividirlo en varias partes o separar todas las páginas en archivos individuales.",
      howTo: [
        "Cargá el PDF que querés dividir.",
        "Elegí el modo: extraer páginas/rango, dividir en partes o separar todas las páginas.",
        "Indicá las páginas con el formato flexible (por ejemplo 1-3,5,8-10). Los rangos son inclusivos y empiezan en 1.",
        "Opcional: editá el nombre del archivo de salida.",
        "Descargá el resultado: un PDF si hay una sola salida, o un ZIP si se generan varios archivos.",
      ],
      useCases: [
        "Separar capítulos o secciones de un documento largo.",
        "Extraer solo las páginas que necesitás enviar.",
        "Dividir un escaneo de varias páginas en archivos individuales.",
        "Quedarte con un formulario o anexo puntual de un PDF extenso.",
      ],
      limits: [
        "Tamaño máximo del PDF: 50 MB.",
        "El modo \"separar todas las páginas\" admite hasta 50 páginas por operación.",
        "Las páginas se numeran desde 1 y los rangos incluyen los extremos.",
      ],
      privacy:
        "El PDF se procesa directamente en tu navegador. El archivo no se sube a ningún servidor de Modulaq.",
      commonErrors: [
        "Rango invertido como 3-1: la página inicial no puede ser mayor que la final.",
        "Páginas fuera de rango: revisá que existan en el documento.",
        "PDF protegido o dañado: puede no poder leerse para dividirse.",
      ],
      technicalNotes: [
        "El procesamiento usa pdf-lib en el navegador.",
        "Cuando se generan varios archivos, se empaquetan en un único ZIP con nombres consistentes.",
      ],
    },
    integrableCode: {
      summary:
        "Dividir corre con pdf-lib en el navegador. Esta versión extrae un rango de páginas a un PDF nuevo (la base para cualquier división). Instalá pdf-lib.",
      snippets: [
        {
          id: "split-pdf-range",
          title: "Extraer un rango de páginas a un PDF nuevo",
          description: "Copia las páginas del rango inclusivo [from, to] (1-based) a un documento nuevo.",
          language: "typescript",
          code: `import { PDFDocument } from "pdf-lib";

// Extrae un rango inclusivo (1-based) a un PDF nuevo. Ej: extractPageRange(file, 2, 5)
export async function extractPageRange(file: File, from: number, to: number): Promise<Uint8Array> {
  const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const result = await PDFDocument.create();

  const indices: number[] = [];
  for (let page = from; page <= to; page += 1) {
    indices.push(page - 1);
  }

  const pages = await result.copyPages(source, indices);
  pages.forEach((page) => result.addPage(page));
  return result.save();
}`,
          dependencies: ["pdf-lib"],
          usageNotes: [
            "from y to son 1-based e inclusivos: extractPageRange(file, 2, 5) devuelve las páginas 2 a 5.",
            "Para descargar, envolvé los bytes en un Blob de tipo application/pdf.",
          ],
          limitations: [
            "Devuelve un único PDF. Para varias salidas en un ZIP, combiná esto con la librería jszip.",
            "Validá que from y to estén dentro del total de páginas (source.getPageCount()).",
            "Un PDF protegido o dañado puede no poder leerse.",
          ],
        },
      ],
    },
  },
  {
    id: "image-to-pdf",
    name: "Imagen a PDF",
    slug: "imagen-a-pdf",
    description: "Convierte una o varias imágenes en un archivo PDF limpio.",
    category: "pdf",
    tags: ["imagen", "pdf", "convertir"],
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      title: "Convertir imágenes a PDF online",
      description:
        "Convertí imágenes PNG, JPG o WebP en un PDF ordenado. Gratis, sin marcas de agua y procesado localmente en tu navegador.",
    },
    doc: {
      summary:
        "Imagen a PDF convierte una o varias imágenes en un PDF, agregando cada imagen como una página.",
      howTo: [
        "Seleccioná las imágenes (PNG, JPG/JPEG o WebP).",
        "Reordená con subir/bajar o quitá las que no quieras.",
        "Opcional: editá el nombre del archivo de salida.",
        "Descargá el PDF generado, que respeta el orden visible.",
      ],
      useCases: [
        "Convertir fotos de un documento en un PDF para enviar.",
        "Armar un PDF a partir de capturas de pantalla.",
        "Unir imágenes escaneadas en un solo documento.",
      ],
      limits: [
        "Formatos admitidos: PNG, JPG/JPEG y WebP.",
        "Hasta 30 imágenes y 100 MB en total; cada imagen, hasta 15 MB.",
      ],
      privacy:
        "Las imágenes se procesan en tu navegador. No se suben a ningún servidor de Modulaq.",
      commonErrors: [
        "Formato de imagen no soportado.",
        "Una imagen dañada que no se puede leer.",
      ],
      technicalNotes: [
        "El procesamiento usa pdf-lib en el navegador.",
        "Cada imagen se ajusta a una página A4 según su orientación; los WebP se convierten a PNG internamente.",
      ],
    },
    integrableCode: {
      summary:
        "Imagen a PDF usa pdf-lib para incrustar imágenes PNG/JPG, una por página. Instalá pdf-lib.",
      snippets: [
        {
          id: "image-to-pdf-core",
          title: "Crear un PDF desde imágenes PNG/JPG",
          description: "Agrega cada imagen como una página del tamaño de la imagen y devuelve los bytes del PDF.",
          language: "typescript",
          code: `import { PDFDocument } from "pdf-lib";

// Cada imagen (PNG o JPG) se agrega como una página del tamaño de la imagen.
export async function imagesToPdf(files: File[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();

  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
    const image = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }

  return pdf.save();
}`,
          dependencies: ["pdf-lib"],
          usageNotes: [
            "Obtené los File desde un input de tipo file con accept de imágenes.",
            "El orden del array es el orden de las páginas.",
          ],
          limitations: [
            "Solo PNG y JPG. WebP no se incrusta directo en pdf-lib: convertilo antes a PNG con un canvas.",
            "Cada página toma el tamaño en píxeles de la imagen; para un A4 fijo, calculá escala y centrado.",
            "Una imagen dañada o de formato no soportado hará fallar embedPng/embedJpg.",
          ],
        },
      ],
    },
  },
  {
    id: "pdf-to-images",
    name: "PDF a imágenes",
    slug: "pdf-a-imagenes",
    description: "Convierte páginas de un PDF en imágenes PNG descargables.",
    category: "pdf",
    tags: ["pdf", "imagen", "exportar"],
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      title: "Convertir PDF a imágenes PNG",
      description:
        "Convertí las páginas de un PDF en imágenes PNG de alta calidad, listas para descargar. Gratis y en tu navegador, sin subir archivos.",
    },
    doc: {
      summary:
        "PDF a imágenes convierte las páginas de un PDF en imágenes PNG, ya sea todas o una selección.",
      howTo: [
        "Cargá el PDF.",
        "Elegí convertir todas las páginas o indicá una selección con el formato flexible (por ejemplo 1-3,5,8-10).",
        "Opcional: editá el nombre del archivo de salida.",
        "Descargá el resultado: un PNG si es una sola página, o un ZIP si son varias.",
      ],
      useCases: [
        "Usar una página del PDF como imagen en una presentación o web.",
        "Extraer figuras, diagramas o portadas.",
        "Previsualizar páginas sin abrir el documento completo.",
      ],
      limits: [
        "Tamaño máximo del PDF: 50 MB.",
        "Hasta 50 páginas por operación.",
        "Las páginas se numeran desde 1 y los rangos incluyen los extremos.",
      ],
      privacy:
        "El PDF se procesa en tu navegador. El archivo no se sube a ningún servidor de Modulaq.",
      commonErrors: [
        "Páginas fuera de rango: revisá que existan en el documento.",
        "PDF protegido o dañado: puede no poder renderizarse.",
      ],
      technicalNotes: [
        "Usa pdf.js para renderizar cada página y exportarla como PNG.",
        "Cuando se generan varias imágenes, se empaquetan en un único ZIP.",
      ],
    },
    integrableCode: {
      summary:
        "PDF a imágenes usa pdfjs-dist + canvas en el navegador. El snippet incluye la configuración del worker para Vite; en las notas están las alternativas (workerPort y CDN).",
      snippets: [
        {
          id: "pdf-to-images-core",
          title: "Renderizar una página de PDF a PNG",
          description: "Renderiza una página a un data URL PNG, con escala configurable. Solo navegador (usa canvas).",
          language: "typescript",
          code: `import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

// pageNumber es 1-based; scale controla la resolución (2 aprox. alta calidad).
export async function renderPdfPageToPng(file: File, pageNumber: number, scale = 2): Promise<string> {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const page = await pdf.getPage(pageNumber);

  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo obtener el contexto 2D del canvas.");
  }

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  await page.render({ canvas, canvasContext: context, viewport }).promise;
  await pdf.destroy();

  return canvas.toDataURL("image/png");
}`,
          dependencies: ["pdfjs-dist"],
          usageNotes: [
            "La config de worker de arriba es para Vite (import con ?url).",
            "Alternativa con bundler genérico (sin Vite): GlobalWorkerOptions.workerPort = new Worker(new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url), { type: 'module' }).",
            "Alternativa CDN: GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/<VERSION>/pdf.worker.min.mjs'.",
            "Para JPEG: canvas.toDataURL('image/jpeg', 0.92). Para varias páginas, iterá de 1 a pdf.numPages.",
          ],
          limitations: [
            "Solo navegador: depende de document.createElement('canvas'); no corre en Node sin polyfills.",
            "Un scale alto sube la resolución y el costo: con páginas grandes puede consumir mucha memoria.",
            "JPEG, multipágina y empaquetado en ZIP (con jszip) quedan como extensiones fuera de este snippet.",
            "La versión del worker debe coincidir con la versión de pdfjs-dist instalada.",
          ],
        },
      ],
    },
  },
  {
    id: "compress-pdf",
    name: "Comprimir PDF",
    slug: "comprimir-pdf",
    description: "Intenta optimizar el tamaño de un PDF directamente desde el navegador.",
    category: "pdf",
    tags: ["pdf", "comprimir", "optimizar"],
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      title: "Comprimir PDF online gratis",
      description:
        "Reducí el tamaño de un PDF directamente en tu navegador, gratis y sin subir archivos. Resultados honestos según el contenido del documento.",
    },
    doc: {
      summary:
        "Comprimir PDF intenta reducir el tamaño de uno o varios PDF reescribiendo su estructura interna, mostrando el resultado real de cada archivo.",
      howTo: [
        "Cargá uno o varios PDF.",
        "Revisá el tamaño original, el final y la diferencia por archivo.",
        "Opcional: editá el nombre del archivo de salida.",
        "Descargá el resultado: un PDF si es uno, o un ZIP si son varios.",
      ],
      useCases: [
        "Reducir el peso de un PDF para adjuntarlo por email.",
        "Preparar un documento para subirlo a sitios con límite de tamaño.",
        "Optimizar PDF generados por otras herramientas.",
      ],
      limits: [
        "Cada archivo admite hasta 50 MB y el conjunto, hasta 100 MB en total.",
        "La reducción depende del contenido: un PDF ya optimizado o con muchas imágenes puede bajar poco o nada. En ese caso se conserva el original.",
      ],
      privacy:
        "Los PDF se procesan en tu navegador. No se suben a ningún servidor de Modulaq.",
      commonErrors: [
        "Un PDF protegido o encriptado no se puede comprimir desde la herramienta.",
        "Algunos PDF con estructuras poco comunes pueden no ser compatibles.",
      ],
      technicalNotes: [
        "Usa pdf-lib para optimizar la estructura del archivo; no recomprime las imágenes.",
        "Por eso la reducción es honesta y, en documentos ya livianos, puede ser mínima.",
      ],
    },
  },
  {
    id: "extract-pdf-text",
    name: "Extraer texto de PDF",
    slug: "extraer-texto-de-pdf",
    description: "Extrae texto seleccionable de un PDF para copiarlo o descargarlo.",
    category: "pdf",
    tags: ["pdf", "texto", "extraer"],
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      title: "Extraer texto de un PDF",
      description:
        "Extraé el texto seleccionable de un PDF para copiarlo o descargarlo como TXT. Gratis, sin instalar y procesado localmente en tu navegador.",
    },
    doc: {
      summary:
        "Extraer texto de PDF recupera el texto seleccionable de un documento para copiarlo o descargarlo como archivo TXT.",
      howTo: [
        "Cargá el PDF.",
        "Opcional: activá conservar los saltos de línea aproximados para mantener mejor el formato.",
        "Revisá el texto extraído por página.",
        "Copiá el resultado o descargalo como TXT.",
      ],
      useCases: [
        "Reutilizar el texto de un documento sin volver a tipearlo.",
        "Citar o buscar contenido dentro de un PDF.",
        "Pasar un documento a texto plano.",
      ],
      limits: [
        "Solo recupera texto seleccionable; un PDF escaneado (imágenes) no tiene texto para extraer y la herramienta lo avisa.",
        "Tamaño máximo del PDF: 50 MB.",
      ],
      privacy:
        "El PDF se procesa en tu navegador. El archivo no se sube a ningún servidor de Modulaq.",
      commonErrors: [
        "El PDF parece escaneado y no tiene texto seleccionable.",
        "Aparecen símbolos extraños cuando el PDF usa fuentes no estándar.",
      ],
      technicalNotes: [
        "Usa pdf.js para leer el contenido de texto.",
        "Detecta si el documento parece escaneado y avisa cuando hay símbolos problemáticos.",
      ],
    },
    integrableCode: {
      summary:
        "Extraer texto usa pdfjs-dist en el navegador. El snippet incluye la configuración del worker para Vite; en las notas están las alternativas (workerPort y CDN).",
      snippets: [
        {
          id: "extract-pdf-text-core",
          title: "Extraer texto seleccionable de un PDF",
          description: "Devuelve el texto por página y unido. Orientado a Vite + navegador moderno.",
          language: "typescript",
          code: `import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export async function extractPdfText(file: File): Promise<{ pages: string[]; text: string }> {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pages: string[] = [];

  for (let n = 1; n <= pdf.numPages; n += 1) {
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\\s+/g, " ")
      .trim();
    pages.push(pageText);
  }

  await pdf.destroy();
  return { pages, text: pages.join("\\n\\n") };
}`,
          dependencies: ["pdfjs-dist"],
          usageNotes: [
            "La config de worker de arriba es para Vite (import con ?url).",
            "Alternativa con bundler genérico (sin Vite): GlobalWorkerOptions.workerPort = new Worker(new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url), { type: 'module' }).",
            "Alternativa CDN: GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/<VERSION>/pdf.worker.min.mjs'.",
            "Usá result.pages para el texto por página o result.text para el texto unido.",
          ],
          limitations: [
            "No hace OCR: solo extrae texto ya seleccionable. Un PDF escaneado (imágenes) puede devolver vacío.",
            "El orden y el espaciado son aproximados (sin reconstrucción de columnas ni saltos de línea de layout).",
            "La versión del worker debe coincidir con la versión de pdfjs-dist instalada.",
          ],
        },
      ],
    },
  },
  {
    id: "pdf-page-counter",
    name: "Contador de páginas PDF",
    slug: "contador-de-paginas-pdf",
    description: "Lee un PDF y muestra la cantidad de páginas detectadas.",
    category: "pdf",
    tags: ["pdf", "paginas", "contador"],
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      title: "Contar páginas de un PDF",
      description:
        "Conocé cuántas páginas tiene un PDF al instante. Gratis, sin instalar y sin subir el archivo: todo ocurre en tu navegador.",
    },
    doc: {
      summary:
        "Contador de páginas PDF muestra cuántas páginas tiene un documento, junto con su nombre y tamaño.",
      howTo: [
        "Cargá el PDF.",
        "Vas a ver el nombre, el tamaño y la cantidad de páginas detectadas.",
      ],
      useCases: [
        "Verificar la cantidad de páginas antes de imprimir.",
        "Controlar un documento recibido.",
        "Chequear si un PDF entra en un límite de envío.",
      ],
      limits: ["Tamaño máximo del PDF: 50 MB."],
      privacy:
        "El PDF se lee en tu navegador. El archivo no se sube a ningún servidor de Modulaq.",
      commonErrors: [
        "El archivo no es un PDF válido.",
        "Un PDF protegido o dañado puede no poder leerse.",
      ],
      technicalNotes: ["Usa pdf-lib para leer la cantidad de páginas del documento."],
    },
    integrableCode: {
      summary:
        "Contar páginas es directo con pdf-lib: cargás el documento en memoria y leés getPageCount(). Corre 100% en el navegador; instalá pdf-lib.",
      snippets: [
        {
          id: "pdf-page-counter-core",
          title: "Contar páginas de un PDF",
          description: "Carga un PDF en memoria y devuelve la cantidad de páginas.",
          language: "typescript",
          code: `import { PDFDocument } from "pdf-lib";

export async function countPdfPages(file: File): Promise<number> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return pdf.getPageCount();
}`,
          dependencies: ["pdf-lib"],
          usageNotes: [
            "Recibe un File del navegador (por ejemplo desde un input de tipo file).",
            "Es asíncrona: usala con await o .then().",
          ],
          limitations: [
            "Un PDF protegido o dañado puede no poder leerse.",
            "Solo cuenta páginas; no extrae texto ni genera miniaturas.",
          ],
        },
      ],
    },
  },
  {
    id: "reorder-pdf-pages",
    name: "Reordenar páginas PDF",
    slug: "reordenar-paginas-pdf",
    description: "Cambia el orden de las páginas de un PDF y descarga el documento reordenado.",
    category: "pdf",
    tags: ["pdf", "paginas", "ordenar"],
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      title: "Reordenar páginas de un PDF",
      description:
        "Cambiá el orden de las páginas de un PDF y descargá el documento reorganizado. Gratis y 100% en tu navegador, sin subir archivos.",
    },
    doc: {
      summary:
        "Reordenar páginas PDF cambia el orden de las páginas de un documento y genera un PDF reorganizado.",
      howTo: [
        "Cargá el PDF.",
        "Subí o bajá las páginas hasta lograr el orden que querés (o restablecé el orden original).",
        "Opcional: editá el nombre del archivo de salida.",
        "Descargá el PDF reordenado.",
      ],
      useCases: [
        "Corregir páginas desordenadas de un escaneo.",
        "Mover una sección a otra posición del documento.",
        "Reorganizar un PDF antes de enviarlo o imprimirlo.",
      ],
      limits: [
        "Tamaño máximo del PDF: 50 MB.",
        "En esta versión el reordenamiento se hace con botones de subir/bajar (sin miniaturas ni arrastrar y soltar).",
      ],
      privacy:
        "El PDF se procesa en tu navegador. El archivo no se sube a ningún servidor de Modulaq.",
      commonErrors: [
        "Un PDF protegido o dañado puede no poder procesarse.",
        "Un orden inválido se valida y avisa antes de generar el archivo.",
      ],
      technicalNotes: [
        "Usa pdf-lib en el navegador.",
        "El documento resultante respeta el orden mostrado en la lista.",
      ],
    },
    integrableCode: {
      summary:
        "Reordenar usa pdf-lib: copiás las páginas en el nuevo orden a un documento nuevo. Instalá pdf-lib.",
      snippets: [
        {
          id: "reorder-pdf-core",
          title: "Reordenar páginas con un array de orden",
          description: "Recibe un array 1-based con todas las páginas en el nuevo orden y devuelve el PDF reorganizado.",
          language: "typescript",
          code: `import { PDFDocument } from "pdf-lib";

// order: array 1-based con TODAS las páginas en el nuevo orden, p. ej. [3, 1, 2]
export async function reorderPdfPages(file: File, order: number[]): Promise<Uint8Array> {
  const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const result = await PDFDocument.create();
  const pages = await result.copyPages(source, order.map((n) => n - 1));
  pages.forEach((page) => result.addPage(page));
  return result.save();
}`,
          dependencies: ["pdf-lib"],
          usageNotes: [
            "order debe incluir todas las páginas, cada una una sola vez. Para 3 páginas: [3, 1, 2].",
            "Para descargar, envolvé los bytes en un Blob de tipo application/pdf.",
          ],
          limitations: [
            "Si order no cubre todas las páginas o repite alguna, el resultado será incorrecto: validá antes.",
            "Un PDF protegido o dañado puede no poder procesarse.",
          ],
        },
      ],
    },
  },
  {
    id: "text-cleaner",
    name: "Limpiador de texto",
    slug: "limpiador-de-texto",
    description: "Normaliza espacios, saltos de línea y contenido pegado desde distintas fuentes.",
    category: "text",
    tags: ["texto", "limpieza", "productividad"],
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      title: "Limpiar y normalizar texto",
      description:
        "Limpiá espacios de más, saltos de línea y caracteres invisibles del texto pegado. Gratis, instantáneo y directo en tu navegador.",
    },
    doc: {
      summary:
        "Limpiador de texto normaliza texto pegado: quita espacios de más, saltos de línea extra, comillas raras y caracteres invisibles, con limpiezas que podés activar o desactivar.",
      howTo: [
        "Pegá el texto que querés limpiar.",
        "Elegí qué limpiezas aplicar (espacios múltiples, saltos extra, comillas, caracteres invisibles, líneas vacías, etc.).",
        "Revisá las estadísticas antes/después: caracteres, palabras y líneas.",
        "Copiá el resultado, descargalo como TXT o usalo como nueva entrada.",
      ],
      useCases: [
        "Limpiar texto copiado desde un PDF o una página web.",
        "Normalizar contenido antes de publicarlo o pegarlo en otra herramienta.",
        "Quitar espacios y líneas vacías sobrantes de un texto.",
      ],
      limits: [
        "Trabaja sobre el texto que pegás; no abre archivos.",
        "Si no seleccionás ninguna limpieza, el texto queda igual.",
      ],
      privacy:
        "El texto se procesa en tu navegador y no sale de tu equipo: no se envía a ningún servidor.",
      commonErrors: [
        "Esperar un cambio sin haber activado ninguna opción de limpieza.",
      ],
      technicalNotes: [
        "La lógica de limpieza vive en un módulo reutilizable y cada opción se aplica de forma independiente.",
      ],
    },
    integrableCode: {
      summary:
        "La limpieza es una función pura sin dependencias: recibe el texto y un objeto de opciones y devuelve el texto normalizado. Copiá la función y usala en cualquier proyecto JS/TS.",
      snippets: [
        {
          id: "text-cleaner-core",
          title: "Función cleanText (sin dependencias)",
          description:
            "Normaliza saltos de línea, espacios múltiples, comillas tipográficas y caracteres invisibles. Cada limpieza se activa por opción.",
          language: "typescript",
          code: `type TextCleanerOptions = {
  removeMultipleSpaces: boolean;
  removeExtraLineBreaks: boolean;
  trimEdges: boolean;
  normalizeQuotes: boolean;
  removeInvisibleCharacters: boolean;
  collapseEmptyLines: boolean;
};

export function cleanText(input: string, options: TextCleanerOptions): string {
  let output = input.replace(/\\r\\n?/g, "\\n");

  if (options.removeInvisibleCharacters) {
    output = output.replace(
      /[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F\\u200B-\\u200D\\uFEFF]/g,
      "",
    );
  }

  if (options.normalizeQuotes) {
    output = output.replace(/[‘’‚‛]/g, "'").replace(/[“”„‟]/g, '"');
  }

  if (options.removeExtraLineBreaks) {
    output = output.replace(/[^\\S\\n]+\\n/g, "\\n").replace(/\\n[^\\S\\n]+/g, "\\n");
  }

  if (options.removeMultipleSpaces) {
    output = output.replace(/[^\\S\\n]{2,}/g, " ");
  }

  if (options.collapseEmptyLines) {
    output = output.replace(/\\n{3,}/g, "\\n\\n");
  }

  if (options.trimEdges) {
    output = output.trim();
  }

  return output;
}`,
          usageNotes: [
            "Pasá un objeto con todas las opciones en true para una limpieza completa, o desactivá las que no quieras.",
            "La función no muta el input: devuelve un texto nuevo.",
          ],
          limitations: [
            "Trabaja sobre strings; no abre ni lee archivos.",
            "No corrige ortografía ni gramática, solo normaliza formato.",
          ],
        },
      ],
    },
  },
  {
    id: "qr-generator",
    name: "Generador de QR",
    slug: "generador-de-qr",
    description: "Crea códigos QR simples para enlaces, texto o información breve.",
    category: "productivity",
    tags: ["qr", "codigo", "productividad"],
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      title: "Generador de códigos QR gratis",
      description:
        "Generá códigos QR para enlaces, texto, email o teléfono y descargalos en PNG. Gratis, sin límites molestos y en tu navegador.",
    },
    doc: {
      summary:
        "Generador de QR crea códigos QR a partir de un enlace, texto, email o teléfono, con vista previa instantánea y descarga en PNG al tamaño que elijas.",
      howTo: [
        "Elegí el tipo de contenido: texto, URL, email o teléfono.",
        "Escribí el contenido. El QR se genera automáticamente cuando es válido.",
        "Elegí el tamaño de salida: 256, 512, 1024 px o un valor personalizado.",
        "Opcional: editá el nombre del archivo.",
        "Descargá el código como PNG.",
      ],
      useCases: [
        "Compartir un enlace en un cartel, slide o folleto.",
        "Poner tu email o teléfono de contacto en una tarjeta.",
        "Enlazar a un menú, formulario o catálogo online.",
        "Generar un QR en alta resolución (1024 px) para impresión.",
      ],
      limits: [
        "El QR está pensado para enlaces o textos breves; contenidos muy largos generan códigos densos y difíciles de escanear.",
        "El tamaño personalizado se admite dentro de límites razonables.",
      ],
      privacy:
        "El código QR se genera localmente en tu navegador. El contenido no se envía a ningún servidor.",
      commonErrors: [
        "Email o URL con formato inválido: la validación visual te avisa antes de generar.",
        "Contenido demasiado largo: el QR resultante puede no ser legible por las cámaras.",
      ],
      technicalNotes: [
        "Usa la librería qrcode en el navegador.",
        "El tamaño seleccionado corresponde al PNG exportado, no solo a la vista previa.",
      ],
    },
    integrableCode: {
      summary:
        "La generación se apoya en la librería qrcode. Construí el valor según el tipo de contenido y obtené un PNG en base64 (data URL) listo para mostrar o descargar.",
      snippets: [
        {
          id: "qr-generator-core",
          title: "Generar un QR como data URL",
          description:
            "Arma el valor del QR según el tipo (texto, URL, email o teléfono) y devuelve un PNG en base64.",
          language: "typescript",
          code: `import QRCode from "qrcode";

type QrContentType = "text" | "url" | "email" | "phone";

function buildQrValue(contentType: QrContentType, input: string): string {
  const trimmed = input.trim();
  if (contentType === "email") return \`mailto:\${trimmed}\`;
  if (contentType === "phone") return \`tel:\${trimmed.replace(/\\s+/g, "")}\`;
  return trimmed;
}

export async function generateQrDataUrl(
  contentType: QrContentType,
  input: string,
  size = 512,
): Promise<string> {
  const value = buildQrValue(contentType, input);
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: size,
    color: { dark: "#13202b", light: "#f3f7fa" },
  });
}`,
          dependencies: ["qrcode"],
          usageNotes: [
            "Instalá la dependencia: npm i qrcode (y npm i -D @types/qrcode si usás TypeScript).",
            "El data URL se puede usar directo en el src de un <img> o convertir a Blob para descargar.",
          ],
          limitations: [
            "Contenidos muy largos generan QR densos y difíciles de escanear.",
            "Pensado para uso en navegador; en Node ajustá las opciones de salida.",
          ],
        },
      ],
    },
  },
];
