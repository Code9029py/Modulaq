import type { ToolDefinition, ToolModeId } from "../types/tool.types";

const v11AvailableModes = ["online"] as const satisfies readonly ToolModeId[];
const v11PlannedModes = ["integrable-code", "api", "documentation"] as const satisfies readonly ToolModeId[];

export const tools: ToolDefinition[] = [
  {
    id: "merge-pdf",
    slug: "unir-pdfs",
    slugEn: "merge-pdf",
    name: { es: "Unir PDFs", en: "Merge PDFs" },
    description: {
      es: "Combina varios archivos PDF en un único documento ordenado.",
      en: "Combine multiple PDF files into a single, ordered document.",
    },
    category: "pdf",
    tags: {
      es: ["pdf", "documentos", "combinar", "archivos"],
      en: ["pdf", "documents", "combine", "files"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Unir PDFs online gratis sin subir archivos",
        description:
          "Combiná varios PDFs en un solo documento y ordenalos como quieras. El procesamiento ocurre en tu navegador; no subimos tus archivos a Modulaq.",
      },
      en: {
        title: "Merge PDFs online free, no uploads",
        description:
          "Combine multiple PDFs into one ordered document. Processing happens in your browser — we don't upload your files to Modulaq.",
      },
    },
    doc: {
      es: {
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
          "El procesamiento de estos archivos ocurre en tu navegador; no los subimos a Modulaq para unirlos.",
        commonErrors: [
          "Algún archivo no es un PDF válido.",
          "Un PDF protegido o dañado puede no poder leerse para unirse.",
        ],
        technicalNotes: [
          "El procesamiento usa pdf-lib en el navegador.",
          "El documento final respeta el orden mostrado en la lista.",
        ],
      },
      en: {
        summary:
          "Merge PDFs combines two or more PDF files into a single document in the order you choose.",
        howTo: [
          "Add two or more PDF files.",
          "Reorder the list with move up/down, or remove the ones you don't want to include.",
          "Optional: edit the output file name.",
          "Download the merged PDF.",
        ],
        useCases: [
          "Bundle related documents, like an invoice and its receipt.",
          "Combine chapters or sections into one file.",
          "Consolidate several scans into a single PDF to send.",
        ],
        limits: [
          "At least two PDFs are required to merge.",
          "Each file can be up to 50 MB and the whole batch up to 100 MB.",
        ],
        privacy:
          "Processing happens in your browser — we don't upload these files to Modulaq to merge them.",
        commonErrors: [
          "A file isn't a valid PDF.",
          "An encrypted or corrupt PDF may not be readable for merging.",
        ],
        technicalNotes: [
          "Processing uses pdf-lib in the browser.",
          "The final document follows the order shown in the list.",
        ],
      },
    },
    integrableCode: {
      summary: {
        es: "Unir PDFs corre en el navegador con pdf-lib: copiás las páginas de cada documento a uno nuevo. Instalá pdf-lib y reutilizá esta función.",
        en: "Merging runs in the browser with pdf-lib: you copy pages from each document into a new one. Install pdf-lib and reuse this function.",
      },
      snippets: [
        {
          id: "merge-pdf-core",
          title: {
            es: "Unir varios PDFs en uno",
            en: "Merge several PDFs into one",
          },
          description: {
            es: "Recibe un array de File en orden y devuelve los bytes del PDF combinado.",
            en: "Takes an ordered array of File and returns the bytes of the merged PDF.",
          },
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
          usageNotes: {
            es: [
              "El orden del array es el orden final de las páginas.",
              "Para descargar, envolvé los bytes en un Blob de tipo application/pdf y usá URL.createObjectURL.",
            ],
            en: [
              "The order of the array is the final page order.",
              "To download, wrap the bytes in a Blob of type application/pdf and use URL.createObjectURL.",
            ],
          },
          limitations: {
            es: [
              "Necesita al menos dos PDFs para que tenga sentido.",
              "Un PDF protegido o encriptado puede no cargar; ignoreEncryption ayuda solo en algunos casos.",
              "No combina formularios ni firmas digitales de forma especial.",
            ],
            en: [
              "Needs at least two PDFs for it to make sense.",
              "An encrypted PDF may fail to load; ignoreEncryption only helps in some cases.",
              "It doesn't merge forms or digital signatures in any special way.",
            ],
          },
        },
      ],
    },
  },
  {
    id: "split-pdf",
    slug: "dividir-pdf",
    slugEn: "split-pdf",
    name: { es: "Dividir PDF", en: "Split PDF" },
    description: {
      es: "Separa un PDF en rangos o páginas individuales.",
      en: "Split a PDF into ranges or individual pages.",
    },
    category: "pdf",
    tags: {
      es: ["pdf", "separar", "paginas", "documentos"],
      en: ["pdf", "split", "pages", "documents"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Dividir PDF online gratis sin subir archivos",
        description:
          "Separá un PDF por rangos o páginas individuales y descargá el resultado. El procesamiento del archivo ocurre en tu navegador.",
      },
      en: {
        title: "Split PDF online free, no uploads",
        description:
          "Split a PDF by ranges or individual pages and download the result. File processing happens in your browser.",
      },
    },
    doc: {
      es: {
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
          "El procesamiento de este archivo ocurre en tu navegador; no lo subimos a Modulaq para dividirlo.",
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
      en: {
        summary:
          "Split PDF breaks a document into parts: you can extract a page range, split into several parts, or separate every page into individual files.",
        howTo: [
          "Upload the PDF you want to split.",
          "Pick the mode: extract pages/range, split into parts, or separate every page.",
          "Enter the pages with the flexible format (e.g. 1-3,5,8-10). Ranges are inclusive and start at 1.",
          "Optional: edit the output file name.",
          "Download the result: a single PDF if there's one output, or a ZIP if several files are generated.",
        ],
        useCases: [
          "Separate chapters or sections of a long document.",
          "Extract only the pages you need to send.",
          "Split a multi-page scan into individual files.",
          "Keep a specific form or appendix from a long PDF.",
        ],
        limits: [
          "Max PDF size: 50 MB.",
          'The "separate every page" mode supports up to 50 pages per run.',
          "Pages are numbered from 1 and ranges include both ends.",
        ],
        privacy:
          "Processing happens in your browser — we don't upload this file to Modulaq to split it.",
        commonErrors: [
          "Reversed range like 3-1: the start page can't be higher than the end.",
          "Out-of-range pages: check that they exist in the document.",
          "Encrypted or damaged PDF: may not be readable to split.",
        ],
        technicalNotes: [
          "Processing uses pdf-lib in the browser.",
          "When several files are generated they're bundled into a single ZIP with consistent names.",
        ],
      },
    },
    integrableCode: {
      summary: {
        es: "Dividir corre con pdf-lib en el navegador. Esta versión extrae un rango de páginas a un PDF nuevo (la base para cualquier división). Instalá pdf-lib.",
        en: "Splitting runs with pdf-lib in the browser. This version extracts a page range into a new PDF (the foundation for any split). Install pdf-lib.",
      },
      snippets: [
        {
          id: "split-pdf-range",
          title: {
            es: "Extraer un rango de páginas a un PDF nuevo",
            en: "Extract a page range into a new PDF",
          },
          description: {
            es: "Copia las páginas del rango inclusivo [from, to] (1-based) a un documento nuevo.",
            en: "Copies pages in the inclusive [from, to] range (1-based) into a new document.",
          },
          language: "typescript",
          code: `import { PDFDocument } from "pdf-lib";

// Extracts an inclusive range (1-based) into a new PDF. E.g. extractPageRange(file, 2, 5)
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
          usageNotes: {
            es: [
              "from y to son 1-based e inclusivos: extractPageRange(file, 2, 5) devuelve las páginas 2 a 5.",
              "Para descargar, envolvé los bytes en un Blob de tipo application/pdf.",
            ],
            en: [
              "from and to are 1-based and inclusive: extractPageRange(file, 2, 5) returns pages 2 through 5.",
              "To download, wrap the bytes in a Blob of type application/pdf.",
            ],
          },
          limitations: {
            es: [
              "Devuelve un único PDF. Para varias salidas en un ZIP, combiná esto con la librería jszip.",
              "Un PDF protegido o encriptado puede no cargar.",
            ],
            en: [
              "Returns a single PDF. For multiple outputs in a ZIP, combine this with the jszip library.",
              "An encrypted PDF may not load.",
            ],
          },
        },
      ],
    },
  },
  {
    id: "image-to-pdf",
    slug: "imagen-a-pdf",
    slugEn: "image-to-pdf",
    name: { es: "Imagen a PDF", en: "Image to PDF" },
    description: {
      es: "Convierte una o varias imágenes en un archivo PDF limpio.",
      en: "Turn one or more images into a clean PDF file.",
    },
    category: "pdf",
    tags: {
      es: ["imagen", "pdf", "convertir"],
      en: ["image", "pdf", "convert"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Convertir imágenes a PDF sin subir archivos",
        description:
          "Convertí imágenes PNG, JPG o WebP en un PDF ordenado. Gratis, sin marcas de agua y con procesamiento en tu navegador.",
      },
      en: {
        title: "Convert images to PDF without uploads",
        description:
          "Turn PNG, JPG or WebP images into an ordered PDF. Free, no watermarks, processed in your browser.",
      },
    },
    doc: {
      es: {
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
          "El procesamiento de estas imágenes ocurre en tu navegador; no las subimos a Modulaq para crear el PDF.",
        commonErrors: [
          "Formato de imagen no soportado.",
          "Una imagen dañada que no se puede leer.",
        ],
        technicalNotes: [
          "El procesamiento usa pdf-lib en el navegador.",
          "Cada imagen se ajusta a una página A4 según su orientación; los WebP se convierten a PNG internamente.",
        ],
      },
      en: {
        summary:
          "Image to PDF turns one or more images into a PDF, adding each image as a page.",
        howTo: [
          "Pick the images (PNG, JPG/JPEG or WebP).",
          "Reorder with move up/down, or remove the ones you don't want.",
          "Optional: edit the output file name.",
          "Download the generated PDF — it follows the visible order.",
        ],
        useCases: [
          "Turn photos of a document into a PDF to send.",
          "Build a PDF from screenshots.",
          "Combine scanned images into a single document.",
        ],
        limits: [
          "Supported formats: PNG, JPG/JPEG and WebP.",
          "Up to 30 images and 100 MB total; each image up to 15 MB.",
        ],
        privacy:
          "Processing happens in your browser — we don't upload these images to Modulaq to create the PDF.",
        commonErrors: [
          "Unsupported image format.",
          "A damaged image that can't be read.",
        ],
        technicalNotes: [
          "Processing uses pdf-lib in the browser.",
          "Each image is fit to an A4 page based on its orientation; WebP is converted to PNG internally.",
        ],
      },
    },
    integrableCode: {
      summary: {
        es: "Imagen a PDF usa pdf-lib para incrustar imágenes PNG/JPG, una por página. Instalá pdf-lib.",
        en: "Image to PDF uses pdf-lib to embed PNG/JPG images, one per page. Install pdf-lib.",
      },
      snippets: [
        {
          id: "image-to-pdf-core",
          title: {
            es: "Crear un PDF desde imágenes PNG/JPG",
            en: "Build a PDF from PNG/JPG images",
          },
          description: {
            es: "Agrega cada imagen como una página del tamaño de la imagen y devuelve los bytes del PDF.",
            en: "Adds each image as a page sized to the image itself and returns the PDF bytes.",
          },
          language: "typescript",
          code: `import { PDFDocument } from "pdf-lib";

// Each image (PNG or JPG) is added as a page sized to the image.
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
          usageNotes: {
            es: [
              "Obtené los File desde un input de tipo file con accept de imágenes.",
              "El orden del array es el orden de las páginas.",
            ],
            en: [
              "Get the File objects from a file input with an image accept attribute.",
              "The array order is the page order.",
            ],
          },
          limitations: {
            es: [
              "Solo PNG y JPG. WebP no se incrusta directo en pdf-lib: convertilo antes a PNG con un canvas.",
              "Cada página toma el tamaño en píxeles de la imagen; para un A4 fijo, calculá escala y centrado.",
              "Una imagen dañada o de formato no soportado hará fallar embedPng/embedJpg.",
            ],
            en: [
              "Only PNG and JPG. WebP can't be embedded directly in pdf-lib — convert it to PNG first via canvas.",
              "Each page is sized to the image's pixel dimensions; for a fixed A4, compute scale and centering yourself.",
              "A corrupt image or unsupported format will make embedPng/embedJpg throw.",
            ],
          },
        },
      ],
    },
  },
  {
    id: "image-converter",
    slug: "convertir-imagen",
    slugEn: "convert-image",
    name: { es: "Convertir imagen", en: "Convert image" },
    description: {
      es: "Convierte una imagen entre formatos compatibles con tu navegador.",
      en: "Convert an image between formats supported by your browser.",
    },
    category: "image",
    tags: {
      es: ["imagen", "convertir", "png", "jpg", "webp"],
      en: ["image", "convert", "png", "jpg", "webp"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Convertir imagen online gratis",
        description:
          "Convertí imágenes a PNG, JPG o WebP compatible desde tu navegador. Sin cuenta y sin subir archivos a Modulaq.",
      },
      en: {
        title: "Convert image online free",
        description:
          "Convert images to PNG, JPG or supported WebP from your browser. No account and no uploads to Modulaq.",
      },
    },
    doc: {
      es: {
        summary:
          "Convertir imagen transforma una imagen a PNG, JPG o WebP cuando el navegador permite exportarlo correctamente.",
        howTo: [
          "Seleccioná una imagen PNG, JPG/JPEG o WebP.",
          "Revisá el tipo, peso y dimensiones detectadas.",
          "Elegí el formato de salida.",
          "Ajustá la calidad si elegís JPG o WebP.",
          "Convertí la imagen y descargá el resultado.",
        ],
        useCases: [
          "Pasar una captura PNG a JPG para reducir peso.",
          "Convertir una imagen JPG a PNG cuando necesitás cambiar el contenedor de salida.",
          "Generar WebP si tu navegador lo soporta.",
        ],
        limits: [
          "No convierte cualquier formato: trabaja con imágenes que el navegador pueda decodificar.",
          "WebP solo aparece como salida si el navegador permite exportarlo correctamente.",
          "Tamaño máximo por imagen: 15 MB.",
        ],
        privacy:
          "El procesamiento de esta imagen ocurre en tu navegador; no la subimos a Modulaq para convertirla.",
        commonErrors: [
          "Archivo que no es una imagen PNG, JPG o WebP.",
          "Imagen dañada o que el navegador no puede decodificar.",
          "Formato de salida no disponible en el navegador actual.",
        ],
        technicalNotes: [
          "La conversión usa canvas del navegador.",
          "JPG no conserva transparencia; la herramienta usa fondo blanco al exportar.",
          "La calidad se aplica a JPG y WebP, no a PNG.",
        ],
      },
      en: {
        summary:
          "Convert image transforms one image into PNG, JPG or WebP when the browser can export it correctly.",
        howTo: [
          "Select a PNG, JPG/JPEG or WebP image.",
          "Review the detected type, size and dimensions.",
          "Choose the output format.",
          "Adjust quality when choosing JPG or WebP.",
          "Convert the image and download the result.",
        ],
        useCases: [
          "Turn a PNG screenshot into JPG to reduce file size.",
          "Convert a JPG image to PNG when you need a different output container.",
          "Generate WebP if your browser supports it.",
        ],
        limits: [
          "It does not convert every format: it works with images the browser can decode.",
          "WebP only appears as output if the browser can export it correctly.",
          "Maximum image size: 15 MB.",
        ],
        privacy:
          "Processing happens in your browser; we don't upload this image to Modulaq to convert it.",
        commonErrors: [
          "A file that is not a PNG, JPG or WebP image.",
          "A damaged image or one the browser cannot decode.",
          "Output format unavailable in the current browser.",
        ],
        technicalNotes: [
          "Conversion uses the browser canvas.",
          "JPG does not preserve transparency; the tool exports it over a white background.",
          "Quality applies to JPG and WebP, not PNG.",
        ],
      },
    },
  },
  {
    id: "image-rotator",
    slug: "rotar-imagen",
    slugEn: "rotate-image",
    name: { es: "Rotar imagen", en: "Rotate image" },
    description: {
      es: "Rota o voltea una imagen directamente en tu navegador.",
      en: "Rotate or flip an image directly in your browser.",
    },
    category: "image",
    tags: {
      es: ["imagen", "rotar", "voltear", "png", "jpg", "webp"],
      en: ["image", "rotate", "flip", "png", "jpg", "webp"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Rotar imagen online gratis",
        description:
          "Rota o voltea una imagen PNG, JPG o WebP desde tu navegador. Sin cuenta y sin subir archivos a Modulaq.",
      },
      en: {
        title: "Rotate image online free",
        description:
          "Rotate or flip a PNG, JPG or WebP image from your browser. No account and no uploads to Modulaq.",
      },
    },
    doc: {
      es: {
        summary:
          "Rotar imagen aplica rotaciones y volteos a una imagen local usando canvas, sin backend y sin subir archivos.",
        howTo: [
          "Selecciona una imagen PNG, JPG/JPEG o WebP.",
          "Revisa el tipo, peso y dimensiones originales.",
          "Aplica una o varias acciones: rotar 90 grados, rotar 180 grados o voltear.",
          "Elige PNG, JPG o WebP si el navegador lo permite.",
          "Prepara la imagen y descarga el resultado.",
        ],
        useCases: [
          "Corregir la orientacion de una foto.",
          "Reflejar una imagen horizontal o verticalmente.",
          "Preparar una captura o recurso visual sin subirlo a un servidor.",
        ],
        limits: [
          "JPG no conserva transparencia.",
          "WebP aparece si tu navegador permite exportarlo correctamente.",
          "Tamano maximo por imagen: 15 MB.",
        ],
        privacy:
          "El procesamiento de esta imagen ocurre en tu navegador; no la subimos a Modulaq para rotarla.",
        commonErrors: [
          "Imagen danada o que el navegador no puede decodificar.",
          "Archivo que no es PNG, JPG o WebP.",
          "Formato de salida no disponible en el navegador actual.",
        ],
        technicalNotes: [
          "La transformacion usa canvas en el navegador.",
          "La rotacion 90/270 intercambia ancho y alto; 0/180 conserva dimensiones.",
          "Los volteos horizontal y vertical conservan las dimensiones.",
        ],
      },
      en: {
        summary:
          "Rotate image applies rotations and flips to a local image with canvas, without backend and without uploads.",
        howTo: [
          "Select a PNG, JPG/JPEG or WebP image.",
          "Review the detected type, size and dimensions.",
          "Apply one or more actions: rotate 90 degrees, rotate 180 degrees or flip.",
          "Choose PNG, JPG or WebP if the browser supports it.",
          "Prepare the image and download the result.",
        ],
        useCases: [
          "Fix a photo orientation.",
          "Mirror an image horizontally or vertically.",
          "Prepare a screenshot or visual asset without uploading it to a server.",
        ],
        limits: [
          "JPG does not preserve transparency.",
          "WebP appears if your browser can export it correctly.",
          "Maximum image size: 15 MB.",
        ],
        privacy:
          "Processing happens in your browser; we don't upload this image to Modulaq to rotate it.",
        commonErrors: [
          "A damaged image or one the browser cannot decode.",
          "A file that is not PNG, JPG or WebP.",
          "Output format unavailable in the current browser.",
        ],
        technicalNotes: [
          "The transformation uses browser canvas.",
          "Rotation by 90/270 swaps width and height; 0/180 keeps dimensions.",
          "Horizontal and vertical flips keep dimensions.",
        ],
      },
    },
  },
  {
    id: "image-cropper",
    slug: "recortar-imagen",
    slugEn: "crop-image",
    name: { es: "Recortar imagen", en: "Crop image" },
    description: {
      es: "Recorta una imagen definiendo el area exacta.",
      en: "Crop an image by defining the exact area.",
    },
    category: "image",
    tags: {
      es: ["imagen", "recortar", "crop", "png", "jpg", "webp"],
      en: ["image", "crop", "trim", "png", "jpg", "webp"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Recortar imagen online gratis",
        description:
          "Recorta una imagen PNG, JPG o WebP definiendo X, Y, ancho y alto en tu navegador. Sin cuenta y sin subir archivos a Modulaq.",
      },
      en: {
        title: "Crop image online free",
        description:
          "Crop a PNG, JPG or WebP image by setting X, Y, width and height in your browser. No account and no uploads to Modulaq.",
      },
    },
    doc: {
      es: {
        summary:
          "Recortar imagen permite definir un area exacta por valores numericos y exportar el recorte localmente desde el navegador.",
        howTo: [
          "Selecciona una imagen PNG, JPG/JPEG o WebP.",
          "Revisa el tipo, peso y dimensiones originales.",
          "Define X, Y, ancho y alto. X/Y empiezan desde la esquina superior izquierda.",
          "Usa los accesos rapidos si quieres imagen completa, recorte centrado o cuadrado centrado.",
          "Elige PNG, JPG o WebP si el navegador lo permite y descarga el resultado.",
        ],
        useCases: [
          "Recortar una zona exacta de una captura.",
          "Preparar una miniatura cuadrada.",
          "Extraer una parte de una foto sin subirla a un servidor.",
        ],
        limits: [
          "JPG no conserva transparencia.",
          "WebP aparece si tu navegador permite exportarlo correctamente.",
          "Tamano maximo por imagen: 15 MB.",
          "El area de recorte no puede salirse de la imagen.",
        ],
        privacy:
          "El procesamiento de esta imagen ocurre en tu navegador; no la subimos a Modulaq para recortarla.",
        commonErrors: [
          "Valores no numericos o negativos.",
          "Ancho o alto igual a cero.",
          "Area de recorte fuera de los limites de la imagen.",
        ],
        technicalNotes: [
          "La exportacion usa canvas en el navegador.",
          "El recorte final tiene las dimensiones indicadas por ancho y alto.",
          "La salida WebP depende del soporte real del navegador.",
        ],
      },
      en: {
        summary:
          "Crop image lets you define an exact area with numeric values and export the crop locally from the browser.",
        howTo: [
          "Select a PNG, JPG/JPEG or WebP image.",
          "Review the detected type, size and dimensions.",
          "Set X, Y, width and height. X/Y start from the top-left corner.",
          "Use quick actions for full image, centered crop or centered square.",
          "Choose PNG, JPG or WebP if the browser supports it and download the result.",
        ],
        useCases: [
          "Crop an exact area from a screenshot.",
          "Prepare a square thumbnail.",
          "Extract part of a photo without uploading it to a server.",
        ],
        limits: [
          "JPG does not preserve transparency.",
          "WebP appears if your browser can export it correctly.",
          "Maximum image size: 15 MB.",
          "The crop area cannot go outside the image.",
        ],
        privacy:
          "Processing happens in your browser; we don't upload this image to Modulaq to crop it.",
        commonErrors: [
          "Non-numeric or negative values.",
          "Width or height equal to zero.",
          "Crop area outside the image bounds.",
        ],
        technicalNotes: [
          "Export uses browser canvas.",
          "The final crop has the width and height you set.",
          "WebP output depends on actual browser support.",
        ],
      },
    },
  },
  {
    id: "image-to-favicon",
    slug: "imagen-a-favicon",
    slugEn: "image-to-favicon",
    name: { es: "Imagen a favicon", en: "Image to favicon" },
    description: {
      es: "Genera un pack de iconos PNG para favicon, Apple touch icon y PWA.",
      en: "Generate a PNG icon pack for favicon, Apple touch icon and PWA.",
    },
    category: "image",
    tags: {
      es: ["imagen", "favicon", "iconos", "png", "pwa"],
      en: ["image", "favicon", "icons", "png", "pwa"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Imagen a favicon online gratis",
        description:
          "Genera un ZIP con iconos PNG para favicon, Apple touch icon y PWA desde tu navegador. Sin cuenta y sin subir archivos a Modulaq.",
      },
      en: {
        title: "Image to favicon online free",
        description:
          "Generate a ZIP with PNG icons for favicon, Apple touch icon and PWA from your browser. No account and no uploads to Modulaq.",
      },
    },
    doc: {
      es: {
        summary:
          "Imagen a favicon crea un pack ZIP con iconos PNG en tamanos comunes para web y PWA. No genera un archivo .ico clasico.",
        howTo: [
          "Selecciona una imagen PNG, JPG/JPEG o WebP.",
          "Revisa el tipo, peso y dimensiones originales.",
          "La herramienta prepara iconos PNG cuadrados en 16, 32, 48, 180, 192 y 512 px.",
          "Opcional: ajusta el nombre del ZIP.",
          "Genera el pack y descarga el ZIP.",
        ],
        useCases: [
          "Preparar favicons PNG para un sitio web.",
          "Crear apple-touch-icon.png desde una imagen de marca.",
          "Generar iconos base para el manifest de una PWA.",
        ],
        limits: [
          "No genera archivo .ico clasico.",
          "Usa ajuste cover centrado: una imagen rectangular puede recortarse para llenar el cuadrado.",
          "Tamano maximo por imagen: 15 MB.",
        ],
        privacy:
          "El procesamiento de esta imagen ocurre en tu navegador; no la subimos a Modulaq para crear favicons.",
        commonErrors: [
          "Archivo que no es una imagen PNG, JPG o WebP.",
          "Imagen danada o que el navegador no puede decodificar.",
          "Imagen con dimensiones invalidas o demasiado grande.",
        ],
        technicalNotes: [
          "La exportacion usa canvas en el navegador.",
          "Los iconos se exportan como PNG y se empaquetan con jszip.",
          "El ZIP incluye un README.txt con ejemplos HTML.",
        ],
      },
      en: {
        summary:
          "Image to favicon creates a ZIP pack with PNG icons in common web and PWA sizes. It does not generate a classic .ico file.",
        howTo: [
          "Select a PNG, JPG/JPEG or WebP image.",
          "Review the detected type, size and dimensions.",
          "The tool prepares square PNG icons at 16, 32, 48, 180, 192 and 512 px.",
          "Optionally adjust the ZIP name.",
          "Generate the pack and download the ZIP.",
        ],
        useCases: [
          "Prepare PNG favicons for a website.",
          "Create apple-touch-icon.png from a brand image.",
          "Generate base icons for a PWA manifest.",
        ],
        limits: [
          "It does not generate a classic .ico file.",
          "It uses centered cover fit: a rectangular image may be cropped to fill the square.",
          "Maximum image size: 15 MB.",
        ],
        privacy:
          "Processing happens in your browser; we don't upload this image to Modulaq to create favicons.",
        commonErrors: [
          "A file that is not PNG, JPG or WebP.",
          "A damaged image or one the browser cannot decode.",
          "An image with invalid dimensions or too many pixels.",
        ],
        technicalNotes: [
          "Export uses browser canvas.",
          "Icons are exported as PNG and bundled with jszip.",
          "The ZIP includes a README.txt with HTML examples.",
        ],
      },
    },
  },
  {
    id: "image-joiner",
    slug: "unir-imagenes",
    slugEn: "join-images",
    name: { es: "Unir imÃ¡genes", en: "Join images" },
    description: {
      es: "Une varias imÃ¡genes en una sola imagen vertical, horizontal o en cuadrÃ­cula.",
      en: "Join multiple images into one vertical, horizontal or grid image.",
    },
    category: "image",
    tags: {
      es: ["imagen", "unir", "combinar", "cuadricula", "png", "jpg", "webp"],
      en: ["image", "join", "combine", "grid", "png", "jpg", "webp"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Unir imÃ¡genes online gratis",
        description:
          "Une imÃ¡genes PNG, JPG o WebP en una sola imagen vertical, horizontal o en cuadrÃ­cula desde tu navegador. Sin subir archivos a Modulaq.",
      },
      en: {
        title: "Join images online free",
        description:
          "Join PNG, JPG or WebP images into one vertical, horizontal or grid image from your browser. No uploads to Modulaq.",
      },
    },
    doc: {
      es: {
        summary:
          "Unir imÃ¡genes combina varias imÃ¡genes locales en un solo canvas con modo vertical, horizontal o cuadrÃ­cula.",
        howTo: [
          "Agrega dos o mÃ¡s imÃ¡genes PNG, JPG/JPEG o WebP.",
          "Revisa nombre, tipo, peso y dimensiones de cada imagen.",
          "Ordena la lista con subir, bajar o eliminar.",
          "Elige modo vertical, horizontal o cuadrÃ­cula. En cuadrÃ­cula, define columnas.",
          "Ajusta separaciÃ³n, padding, color de fondo y formato de salida.",
          "Une las imÃ¡genes y descarga el resultado.",
        ],
        useCases: [
          "Crear una tira vertical de capturas.",
          "Poner imÃ¡genes lado a lado.",
          "Armar una cuadrÃ­cula simple sin subir archivos.",
        ],
        limits: [
          "JPG no conserva transparencia.",
          "WebP aparece si tu navegador permite exportarlo correctamente.",
          "Hasta 30 imÃ¡genes, 15 MB por imagen y 100 MB en total.",
          "Las imÃ¡genes se dibujan en sus dimensiones originales.",
        ],
        privacy:
          "El procesamiento de estas imÃ¡genes ocurre en tu navegador; no las subimos a Modulaq para unirlas.",
        commonErrors: [
          "Archivo que no es una imagen PNG, JPG o WebP.",
          "Imagen daÃ±ada o que el navegador no puede decodificar.",
          "Canvas final demasiado grande para procesarlo localmente.",
        ],
        technicalNotes: [
          "La exportaciÃ³n usa canvas en el navegador.",
          "Vertical y horizontal centran cada imagen en el eje secundario.",
          "La cuadrÃ­cula usa celdas uniformes y calcula filas automÃ¡ticamente.",
        ],
      },
      en: {
        summary:
          "Join images combines multiple local images into one canvas with vertical, horizontal or grid mode.",
        howTo: [
          "Add two or more PNG, JPG/JPEG or WebP images.",
          "Review each image name, type, size and dimensions.",
          "Order the list with move up, move down or remove.",
          "Choose vertical, horizontal or grid mode. In grid mode, set columns.",
          "Adjust spacing, padding, background color and output format.",
          "Join the images and download the result.",
        ],
        useCases: [
          "Create a vertical strip of screenshots.",
          "Place images side by side.",
          "Build a simple grid without uploading files.",
        ],
        limits: [
          "JPG does not preserve transparency.",
          "WebP appears if your browser can export it correctly.",
          "Up to 30 images, 15 MB each and 100 MB total.",
          "Images are drawn at their original dimensions.",
        ],
        privacy:
          "Processing happens in your browser; we don't upload these images to Modulaq to join them.",
        commonErrors: [
          "A file that is not PNG, JPG or WebP.",
          "A damaged image or one the browser cannot decode.",
          "Final canvas too large to process locally.",
        ],
        technicalNotes: [
          "Export uses browser canvas.",
          "Vertical and horizontal modes center each image on the secondary axis.",
          "Grid mode uses uniform cells and calculates rows automatically.",
        ],
      },
    },
  },
  {
    id: "image-splitter",
    slug: "dividir-imagen",
    slugEn: "split-image",
    name: { es: "Dividir imagen", en: "Split image" },
    description: {
      es: "Divide una imagen en varias partes por filas y columnas o por tamano fijo.",
      en: "Split one image into multiple parts by rows and columns or by fixed size.",
    },
    category: "image",
    tags: {
      es: ["imagen", "dividir", "partes", "cuadricula", "zip", "png", "jpg", "webp"],
      en: ["image", "split", "parts", "grid", "zip", "png", "jpg", "webp"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Dividir imagen online gratis",
        description:
          "Divide una imagen PNG, JPG o WebP en partes por filas y columnas o por tamano fijo. Descarga el resultado como ZIP sin subir archivos.",
      },
      en: {
        title: "Split image online free",
        description:
          "Split a PNG, JPG or WebP image into parts by rows and columns or fixed size. Download the result as a ZIP with no uploads.",
      },
    },
    doc: {
      es: {
        summary:
          "Dividir imagen separa una imagen local en varias partes y descarga los resultados en un ZIP.",
        howTo: [
          "Selecciona una imagen PNG, JPG/JPEG o WebP.",
          "Revisa el tipo, peso y dimensiones originales.",
          "Elige filas y columnas, o define ancho y alto fijo para cada parte.",
          "Revisa la cantidad de partes y la vista previa.",
          "Elige PNG, JPG o WebP si el navegador lo permite.",
          "Divide la imagen y descarga el ZIP.",
        ],
        useCases: [
          "Cortar una imagen grande en una cuadricula.",
          "Preparar tiles de tamano fijo.",
          "Separar una captura larga en partes manejables.",
        ],
        limits: [
          "Maximo 100 partes por operacion.",
          "JPG no conserva transparencia.",
          "WebP aparece si tu navegador permite exportarlo correctamente.",
          "Tamano maximo por imagen: 15 MB.",
        ],
        privacy:
          "El procesamiento de esta imagen ocurre en tu navegador; no la subimos a Modulaq para dividirla.",
        commonErrors: [
          "Filas, columnas, ancho o alto con valores no validos.",
          "La division supera el limite de 100 partes.",
          "Imagen danada o que el navegador no puede decodificar.",
        ],
        technicalNotes: [
          "La exportacion usa canvas en el navegador.",
          "Las partes se empaquetan en ZIP con jszip.",
          "Si el tamano fijo no calza exacto, el borde derecho o inferior genera partes mas pequenas.",
        ],
      },
      en: {
        summary:
          "Split image separates a local image into multiple parts and downloads the results in a ZIP.",
        howTo: [
          "Select a PNG, JPG/JPEG or WebP image.",
          "Review the detected type, size and dimensions.",
          "Choose rows and columns, or set a fixed width and height for each part.",
          "Review the part count and preview.",
          "Choose PNG, JPG or WebP if the browser supports it.",
          "Split the image and download the ZIP.",
        ],
        useCases: [
          "Cut a large image into a grid.",
          "Prepare fixed-size tiles.",
          "Separate a long screenshot into manageable parts.",
        ],
        limits: [
          "Maximum 100 parts per operation.",
          "JPG does not preserve transparency.",
          "WebP appears if your browser can export it correctly.",
          "Maximum image size: 15 MB.",
        ],
        privacy:
          "Processing happens in your browser; we don't upload this image to Modulaq to split it.",
        commonErrors: [
          "Rows, columns, width or height with invalid values.",
          "The split exceeds the 100-part limit.",
          "A damaged image or one the browser cannot decode.",
        ],
        technicalNotes: [
          "Export uses browser canvas.",
          "Parts are bundled into a ZIP with jszip.",
          "If fixed size does not fit exactly, the right or bottom edge creates smaller parts.",
        ],
      },
    },
  },
  {
    id: "image-color-extractor",
    slug: "extraer-colores-imagen",
    slugEn: "extract-image-colors",
    name: { es: "Extraer colores de imagen", en: "Extract image colors" },
    description: {
      es: "Extrae una paleta aproximada de colores dominantes desde una imagen.",
      en: "Extract an approximate palette of dominant colors from an image.",
    },
    category: "image",
    tags: {
      es: ["imagen", "colores", "paleta", "hex", "rgb"],
      en: ["image", "colors", "palette", "hex", "rgb"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Extraer colores de imagen online gratis",
        description:
          "Extrae una paleta aproximada de colores dominantes desde una imagen PNG, JPG o WebP. Copia HEX/RGB y descarga TXT o JSON sin subir archivos.",
      },
      en: {
        title: "Extract image colors online free",
        description:
          "Extract an approximate dominant color palette from a PNG, JPG or WebP image. Copy HEX/RGB and download TXT or JSON with no uploads.",
      },
    },
    doc: {
      es: {
        summary:
          "Extraer colores de imagen analiza una imagen local y devuelve una paleta aproximada de colores dominantes.",
        howTo: [
          "Selecciona una imagen PNG, JPG/JPEG o WebP.",
          "Revisa el tipo, peso y dimensiones originales.",
          "Elige la cantidad de colores: 4, 6, 8 o 12.",
          "Extrae la paleta y revisa HEX, RGB y porcentaje aproximado.",
          "Copia valores individuales o descarga la paleta como TXT o JSON.",
        ],
        useCases: [
          "Obtener colores base para una interfaz.",
          "Tomar referencias HEX/RGB desde una imagen de marca.",
          "Crear una paleta rapida desde una foto o captura.",
        ],
        limits: [
          "Los colores son una estimacion basada en muestreo local.",
          "No promete precision perfecta ni una paleta exacta.",
          "Ignora pixeles totalmente transparentes.",
          "Tamano maximo por imagen: 15 MB.",
        ],
        privacy:
          "El procesamiento de esta imagen ocurre en tu navegador; no la subimos a Modulaq para extraer colores.",
        commonErrors: [
          "Archivo que no es una imagen PNG, JPG o WebP.",
          "Imagen danada o que el navegador no puede decodificar.",
          "Imagen sin pixeles visibles luego de ignorar transparencia total.",
        ],
        technicalNotes: [
          "El analisis usa canvas en el navegador.",
          "Se muestrean hasta 50.000 pixeles.",
          "La paleta se obtiene con cuantizacion RGB simple y orden por frecuencia.",
        ],
      },
      en: {
        summary:
          "Extract image colors analyzes a local image and returns an approximate dominant color palette.",
        howTo: [
          "Select a PNG, JPG/JPEG or WebP image.",
          "Review the detected type, size and dimensions.",
          "Choose the color count: 4, 6, 8 or 12.",
          "Extract the palette and review HEX, RGB and approximate percentage.",
          "Copy individual values or download the palette as TXT or JSON.",
        ],
        useCases: [
          "Get base colors for an interface.",
          "Pull HEX/RGB references from a brand image.",
          "Create a quick palette from a photo or screenshot.",
        ],
        limits: [
          "Colors are an estimate based on local sampling.",
          "It does not promise perfect precision or an exact palette.",
          "Fully transparent pixels are ignored.",
          "Maximum image size: 15 MB.",
        ],
        privacy:
          "Processing happens in your browser; we don't upload this image to Modulaq to extract colors.",
        commonErrors: [
          "A file that is not PNG, JPG or WebP.",
          "A damaged image or one the browser cannot decode.",
          "An image with no visible pixels after fully transparent pixels are ignored.",
        ],
        technicalNotes: [
          "Analysis uses browser canvas.",
          "Up to 50,000 pixels are sampled.",
          "The palette uses simple RGB quantization and frequency ordering.",
        ],
      },
    },
  },
  {
    id: "image-placeholder",
    slug: "generar-placeholder-imagen",
    slugEn: "generate-placeholder-image",
    name: { es: "Generar imagen placeholder", en: "Generate placeholder image" },
    description: {
      es: "Genera una imagen placeholder para disenos, pruebas o desarrollo web.",
      en: "Generate a placeholder image for layouts, tests or web development.",
    },
    category: "image",
    tags: {
      es: ["imagen", "placeholder", "diseno", "desarrollo", "png", "jpg", "webp"],
      en: ["image", "placeholder", "design", "development", "png", "jpg", "webp"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Generar imagen placeholder online gratis",
        description:
          "Genera una imagen placeholder configurando tamano, texto y colores. Exporta PNG, JPG o WebP desde tu navegador, sin backend.",
      },
      en: {
        title: "Generate placeholder image online free",
        description:
          "Generate a placeholder image by setting size, text and colors. Export PNG, JPG or WebP from your browser, with no backend.",
      },
    },
    doc: {
      es: {
        summary:
          "Generar imagen placeholder crea una imagen simple con tamano, texto y colores configurables desde el navegador.",
        howTo: [
          "Define ancho y alto.",
          "Edita el texto o deja el texto automatico basado en las dimensiones.",
          "Elige color de fondo y color de texto.",
          "Selecciona PNG, JPG o WebP si el navegador lo permite.",
          "Genera la imagen y descargala.",
        ],
        useCases: [
          "Crear imagenes temporales para maquetas.",
          "Probar layouts web con dimensiones reales.",
          "Generar placeholders simples para desarrollo.",
        ],
        limits: [
          "Maximo 8000 px por lado.",
          "Maximo 64 megapixeles.",
          "No es un editor avanzado: genera texto centrado sobre fondo plano.",
          "WebP aparece si tu navegador permite exportarlo correctamente.",
        ],
        privacy:
          "La imagen se genera localmente en tu navegador; no se sube nada a Modulaq.",
        commonErrors: [
          "Ancho o alto con valores no validos.",
          "Dimensiones demasiado grandes para canvas.",
          "Formato de salida no disponible en el navegador actual.",
        ],
        technicalNotes: [
          "La exportacion usa canvas en el navegador.",
          "La calidad aplica a JPG y WebP, no a PNG.",
          "El nombre de salida se deriva de las dimensiones.",
        ],
      },
      en: {
        summary:
          "Generate placeholder image creates a simple image with configurable size, text and colors from the browser.",
        howTo: [
          "Set width and height.",
          "Edit the text or keep the automatic text based on dimensions.",
          "Choose background color and text color.",
          "Select PNG, JPG or WebP if the browser supports it.",
          "Generate the image and download it.",
        ],
        useCases: [
          "Create temporary images for mockups.",
          "Test web layouts with real dimensions.",
          "Generate simple placeholders for development.",
        ],
        limits: [
          "Maximum 8000 px per side.",
          "Maximum 64 megapixels.",
          "It is not an advanced editor: it creates centered text over a flat background.",
          "WebP appears if your browser can export it correctly.",
        ],
        privacy:
          "The image is generated locally in your browser; nothing is uploaded to Modulaq.",
        commonErrors: [
          "Width or height with invalid values.",
          "Dimensions too large for canvas.",
          "Output format unavailable in the current browser.",
        ],
        technicalNotes: [
          "Export uses browser canvas.",
          "Quality applies to JPG and WebP, not PNG.",
          "The output name is derived from dimensions.",
        ],
      },
    },
  },
  {
    id: "image-compressor",
    slug: "comprimir-imagen",
    slugEn: "compress-image",
    name: { es: "Comprimir imagen", en: "Compress image" },
    description: {
      es: "Intenta reducir el peso de una imagen ajustando formato y calidad.",
      en: "Try to reduce an image file size by adjusting format and quality.",
    },
    category: "image",
    tags: {
      es: ["imagen", "comprimir", "optimizar", "jpg", "webp"],
      en: ["image", "compress", "optimize", "jpg", "webp"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Comprimir imagen online gratis",
        description:
          "Intentá reducir el peso de una imagen ajustando formato y calidad en tu navegador. El resultado depende del archivo original.",
      },
      en: {
        title: "Compress image online free",
        description:
          "Try to reduce an image file size by adjusting format and quality in your browser. Results depend on the original file.",
      },
    },
    doc: {
      es: {
        summary:
          "Comprimir imagen intenta reducir el peso de una imagen mediante canvas, cambiando formato y calidad sin subir el archivo.",
        howTo: [
          "Seleccioná una imagen PNG, JPG/JPEG o WebP.",
          "Revisá el peso y dimensiones originales.",
          "Elegí JPG, WebP si está disponible, o PNG cuando necesites conservar nitidez/transparencia.",
          "Ajustá la calidad para JPG o WebP.",
          "Comprimí la imagen y revisá si hubo reducción o aumento antes de descargar.",
        ],
        useCases: [
          "Bajar el peso de una foto antes de compartirla.",
          "Probar WebP para imágenes de una web.",
          "Generar una versión JPG más liviana cuando no necesitás transparencia.",
        ],
        limits: [
          "No hay reducción garantizada: depende del formato original, el contenido y el navegador.",
          "No redimensiona imágenes; mantiene las dimensiones originales.",
          "Tamaño máximo por imagen: 15 MB.",
        ],
        privacy:
          "El procesamiento de esta imagen ocurre en tu navegador; no la subimos a Modulaq para comprimirla.",
        commonErrors: [
          "Imagen dañada o que el navegador no puede decodificar.",
          "El archivo final puede pesar más si el formato elegido no conviene para esa imagen.",
          "WebP puede no estar disponible como salida en algunos navegadores.",
        ],
        technicalNotes: [
          "La exportación usa canvas.toBlob.",
          "JPG no conserva transparencia; la herramienta exporta sobre fondo blanco.",
          "PNG no usa control de calidad y puede no reducir peso.",
        ],
      },
      en: {
        summary:
          "Compress image tries to reduce an image file size with browser canvas by changing format and quality without uploading the file.",
        howTo: [
          "Select a PNG, JPG/JPEG or WebP image.",
          "Review the original size and dimensions.",
          "Choose JPG, WebP if available, or PNG when you need to preserve sharpness/transparency.",
          "Adjust quality for JPG or WebP.",
          "Compress the image and check whether it reduced or increased before downloading.",
        ],
        useCases: [
          "Lower the weight of a photo before sharing it.",
          "Try WebP for website images.",
          "Generate a lighter JPG version when transparency is not needed.",
        ],
        limits: [
          "Reduction is not guaranteed: it depends on the original format, content and browser.",
          "It does not resize images; original dimensions are preserved.",
          "Maximum image size: 15 MB.",
        ],
        privacy:
          "Processing happens in your browser; we don't upload this image to Modulaq to compress it.",
        commonErrors: [
          "A damaged image or one the browser cannot decode.",
          "The final file can be larger when the chosen format is not suitable for that image.",
          "WebP may be unavailable as output in some browsers.",
        ],
        technicalNotes: [
          "Export uses canvas.toBlob.",
          "JPG does not preserve transparency; the tool exports over a white background.",
          "PNG has no quality control and may not reduce file size.",
        ],
      },
    },
  },
  {
    id: "image-resizer",
    slug: "redimensionar-imagen",
    slugEn: "resize-image",
    name: { es: "Redimensionar imagen", en: "Resize image" },
    description: {
      es: "Cambia el tamaño de una imagen manteniendo proporción o usando medidas exactas.",
      en: "Resize an image while preserving aspect ratio or using exact dimensions.",
    },
    category: "image",
    tags: {
      es: ["imagen", "redimensionar", "tamaño", "png", "jpg", "webp"],
      en: ["image", "resize", "dimensions", "png", "jpg", "webp"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Redimensionar imagen online gratis",
        description:
          "Cambiá ancho, alto o porcentaje de una imagen en tu navegador. Mantiene proporción por defecto y permite exportar PNG, JPG o WebP compatible.",
      },
      en: {
        title: "Resize image online free",
        description:
          "Change image width, height or scale percentage in your browser. Keeps aspect ratio by default and exports PNG, JPG or supported WebP.",
      },
    },
    doc: {
      es: {
        summary:
          "Redimensionar imagen cambia las dimensiones de una imagen localmente, con proporción activada por defecto y salida en formatos compatibles.",
        howTo: [
          "Seleccioná una imagen PNG, JPG/JPEG o WebP.",
          "Revisá el ancho, alto, peso y tipo original.",
          "Cambiá ancho, alto o porcentaje de escala.",
          "Dejá activado mantener proporción para evitar deformaciones, o desactivalo para medidas exactas.",
          "Elegí formato de salida y descargá la imagen redimensionada.",
        ],
        useCases: [
          "Reducir una imagen grande antes de subirla a una web.",
          "Crear una versión con medidas exactas para una publicación.",
          "Escalar una captura o foto por porcentaje.",
        ],
        limits: [
          "Máximo: 8000 px por lado y 64 megapíxeles por salida.",
          "Dimensiones muy grandes pueden consumir más memoria del navegador.",
          "No mejora la calidad de una imagen pequeña al ampliarla.",
        ],
        privacy:
          "El procesamiento de esta imagen ocurre en tu navegador; no la subimos a Modulaq para redimensionarla.",
        commonErrors: [
          "Valores vacíos, cero, negativos o no numéricos.",
          "Dimensiones demasiado grandes para procesarlas con estabilidad.",
          "Imagen dañada o que el navegador no puede decodificar.",
        ],
        technicalNotes: [
          "La redimensión usa canvas del navegador.",
          "JPG no conserva transparencia; la herramienta exporta sobre fondo blanco.",
          "La salida WebP depende del soporte real del navegador.",
        ],
      },
      en: {
        summary:
          "Resize image changes image dimensions locally, with aspect ratio on by default and output in compatible formats.",
        howTo: [
          "Select a PNG, JPG/JPEG or WebP image.",
          "Review original width, height, size and type.",
          "Change width, height or scale percentage.",
          "Keep aspect ratio enabled to avoid distortion, or disable it for exact dimensions.",
          "Choose output format and download the resized image.",
        ],
        useCases: [
          "Reduce a large image before uploading it to a website.",
          "Create an exact-size version for a post.",
          "Scale a screenshot or photo by percentage.",
        ],
        limits: [
          "Maximum: 8000 px per side and 64 megapixels per output.",
          "Very large dimensions can consume more browser memory.",
          "Upscaling a small image does not improve its quality.",
        ],
        privacy:
          "Processing happens in your browser; we don't upload this image to Modulaq to resize it.",
        commonErrors: [
          "Empty, zero, negative or non-numeric values.",
          "Dimensions too large to process reliably.",
          "A damaged image or one the browser cannot decode.",
        ],
        technicalNotes: [
          "Resizing uses the browser canvas.",
          "JPG does not preserve transparency; the tool exports over a white background.",
          "WebP output depends on actual browser support.",
        ],
      },
    },
  },
  {
    id: "image-base64",
    slug: "imagen-base64",
    slugEn: "image-base64",
    name: { es: "Imagen ↔ Base64", en: "Image ↔ Base64" },
    description: {
      es: "Convierte imágenes a Base64 y reconstruye imágenes desde Base64 o Data URL.",
      en: "Convert images to Base64 and rebuild images from Base64 or Data URLs.",
    },
    category: "image",
    tags: {
      es: ["imagen", "base64", "data url", "html", "css"],
      en: ["image", "base64", "data url", "html", "css"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Imagen a Base64 y Base64 a imagen online",
        description:
          "Convertí una imagen a Base64 o reconstruí una imagen desde Base64/Data URL. Todo se procesa localmente en tu navegador.",
      },
      en: {
        title: "Image to Base64 and Base64 to image online",
        description:
          "Convert an image to Base64 or rebuild an image from Base64/Data URL. Everything runs locally in your browser.",
      },
    },
    doc: {
      es: {
        summary:
          "Imagen ↔ Base64 ofrece dos modos internos: convertir una imagen a Base64/Data URL y reconstruir una imagen desde texto Base64.",
        howTo: [
          "Elegí el modo Imagen a Base64 o Base64 a imagen.",
          "Para imagen a Base64, cargá una imagen PNG, JPG/JPEG o WebP.",
          "Copiá Base64 puro o Data URL completa, o descargá el resultado como TXT.",
          "Para Base64 a imagen, pegá Base64 puro o una Data URL.",
          "Si pegás Base64 puro, elegí el tipo de imagen esperado antes de reconstruir.",
        ],
        useCases: [
          "Incrustar una imagen pequeña en HTML, CSS o JSON.",
          "Probar payloads Base64 en desarrollo.",
          "Recuperar una imagen a partir de una Data URL.",
        ],
        limits: [
          "Base64 suele ocupar más que el archivo binario original.",
          "No comprime, optimiza ni convierte formato de imagen.",
          "Una cadena Base64 válida puede no representar una imagen previsualizable.",
        ],
        privacy:
          "La conversión y reconstrucción ocurren en tu navegador; no subimos estos datos a Modulaq.",
        commonErrors: [
          "Base64 inválido o incompleto.",
          "Data URL sin MIME válido.",
          "Base64 válido que no corresponde a una imagen del tipo elegido.",
        ],
        technicalNotes: [
          "Imagen a Base64 usa FileReader.readAsDataURL.",
          "Base64 a imagen decodifica con atob y genera un Blob local.",
          "Los MIME admitidos son image/png, image/jpeg e image/webp.",
        ],
      },
      en: {
        summary:
          "Image ↔ Base64 provides two internal modes: convert an image to Base64/Data URL and rebuild an image from Base64 text.",
        howTo: [
          "Choose Image to Base64 or Base64 to image.",
          "For image to Base64, upload a PNG, JPG/JPEG or WebP image.",
          "Copy the plain Base64 or full Data URL, or download the result as TXT.",
          "For Base64 to image, paste plain Base64 or a Data URL.",
          "If you paste plain Base64, choose the expected image type before rebuilding.",
        ],
        useCases: [
          "Embed a small image in HTML, CSS or JSON.",
          "Test Base64 payloads during development.",
          "Recover an image from a Data URL.",
        ],
        limits: [
          "Base64 usually takes more space than the original binary file.",
          "It does not compress, optimize or convert the image format.",
          "A valid Base64 string may not represent a previewable image.",
        ],
        privacy:
          "Conversion and rebuilding happen in your browser; we don't upload this data to Modulaq.",
        commonErrors: [
          "Invalid or incomplete Base64.",
          "Data URL without a valid MIME type.",
          "Valid Base64 that does not match the selected image type.",
        ],
        technicalNotes: [
          "Image to Base64 uses FileReader.readAsDataURL.",
          "Base64 to image decodes with atob and creates a local Blob.",
          "Supported MIME types are image/png, image/jpeg and image/webp.",
        ],
      },
    },
  },
  {
    id: "pdf-to-images",
    slug: "pdf-a-imagenes",
    slugEn: "pdf-to-images",
    name: { es: "PDF a imágenes", en: "PDF to images" },
    description: {
      es: "Convierte páginas de un PDF en imágenes PNG o JPG descargables.",
      en: "Turn PDF pages into downloadable PNG or JPG images.",
    },
    category: "pdf",
    tags: {
      es: ["pdf", "imagen", "exportar"],
      en: ["pdf", "image", "export"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Convertir PDF a imágenes PNG o JPG online",
        description:
          "Convertí páginas de un PDF en imágenes PNG o JPG descargables. El renderizado ocurre localmente en tu navegador.",
      },
      en: {
        title: "Convert PDF to PNG or JPG images online",
        description:
          "Turn PDF pages into downloadable PNG or JPG images. Rendering happens locally in your browser.",
      },
    },
    doc: {
      es: {
        summary:
          "PDF a imágenes convierte las páginas de un PDF en imágenes PNG o JPG, ya sea todas o una selección.",
        howTo: [
          "Cargá el PDF.",
          "Elegí convertir todas las páginas o indicá una selección con el formato flexible (por ejemplo 1-3,5,8-10).",
          "Opcional: editá el nombre del archivo de salida.",
          "Elegí PNG para priorizar nitidez o JPG para ajustar calidad y generar archivos más livianos.",
          "Descargá el resultado: una imagen si es una sola página, o un ZIP si son varias.",
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
          "El procesamiento de este archivo ocurre en tu navegador; no lo subimos a Modulaq para convertirlo en imágenes.",
        commonErrors: [
          "Páginas fuera de rango: revisá que existan en el documento.",
          "PDF protegido o dañado: puede no poder renderizarse.",
        ],
        technicalNotes: [
          "Usa pdf.js para renderizar cada página y exportarla como PNG o JPG.",
          "Cuando se generan varias imágenes, se empaquetan en un único ZIP.",
        ],
      },
      en: {
        summary:
          "PDF to images turns PDF pages into PNG or JPG images, either all of them or a selection.",
        howTo: [
          "Upload the PDF.",
          "Choose to convert every page or enter a selection using the flexible format (e.g. 1-3,5,8-10).",
          "Optional: edit the output file name.",
          "Pick PNG for sharper output or JPG to tweak quality and get smaller files.",
          "Download the result: a single image for one page, or a ZIP for several.",
        ],
        useCases: [
          "Use a PDF page as an image in a slide or website.",
          "Extract figures, diagrams, or covers.",
          "Preview pages without opening the whole document.",
        ],
        limits: [
          "Max PDF size: 50 MB.",
          "Up to 50 pages per run.",
          "Pages are numbered from 1 and ranges include both ends.",
        ],
        privacy:
          "Processing happens in your browser — we don't upload this file to Modulaq to render images.",
        commonErrors: [
          "Out-of-range pages: check that they exist in the document.",
          "Encrypted or damaged PDF: it may not render.",
        ],
        technicalNotes: [
          "Uses pdf.js to render each page and export it as PNG or JPG.",
          "When several images are produced they're bundled into a single ZIP.",
        ],
      },
    },
    integrableCode: {
      summary: {
        es: "PDF a imágenes usa pdfjs-dist + canvas en el navegador. El snippet incluye la configuración del worker para Vite; en las notas están las alternativas para PNG/JPG y worker (workerPort y CDN).",
        en: "PDF to images uses pdfjs-dist + canvas in the browser. The snippet includes the worker setup for Vite; the notes cover PNG/JPG and worker alternatives (workerPort and CDN).",
      },
      snippets: [
        {
          id: "pdf-to-images-core",
          title: {
            es: "Renderizar una página de PDF a PNG o JPG",
            en: "Render a PDF page to PNG or JPG",
          },
          description: {
            es: "Renderiza una página a un data URL PNG o JPG, con escala configurable. Solo navegador (usa canvas).",
            en: "Renders a page to a PNG or JPG data URL with configurable scale. Browser-only (uses canvas).",
          },
          language: "typescript",
          code: `import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

// pageNumber is 1-based; scale controls the resolution (2 is roughly high quality).
export async function renderPdfPageToImage(
  file: File,
  pageNumber: number,
  scale = 2,
  format: "png" | "jpeg" = "png",
  quality = 0.92,
): Promise<string> {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const page = await pdf.getPage(pageNumber);

  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Couldn't get the canvas 2D context.");
  }

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  await page.render({ canvas, canvasContext: context, viewport }).promise;
  await pdf.destroy();

  return canvas.toDataURL(format === "jpeg" ? "image/jpeg" : "image/png", format === "jpeg" ? quality : undefined);
}`,
          dependencies: ["pdfjs-dist"],
          usageNotes: {
            es: [
              "La config de worker de arriba es para Vite (import con ?url).",
              "Alternativa con bundler genérico (sin Vite): GlobalWorkerOptions.workerPort = new Worker(new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url), { type: 'module' }).",
              "Alternativa CDN: GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/<VERSION>/pdf.worker.min.mjs'.",
              "Para varias páginas, iterá de 1 a pdf.numPages.",
            ],
            en: [
              "The worker config above is for Vite (import with ?url).",
              "Generic bundler alternative (no Vite): GlobalWorkerOptions.workerPort = new Worker(new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url), { type: 'module' }).",
              "CDN alternative: GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/<VERSION>/pdf.worker.min.mjs'.",
              "For several pages, loop from 1 to pdf.numPages.",
            ],
          },
          limitations: {
            es: [
              "Solo navegador: depende de document.createElement('canvas'); no corre en Node sin polyfills.",
              "Un scale alto sube la resolución y el costo: con páginas grandes puede consumir mucha memoria.",
              "El empaquetado multipágina en ZIP (con jszip) queda como extensión fuera de este snippet.",
              "La versión del worker debe coincidir con la versión de pdfjs-dist instalada.",
            ],
            en: [
              "Browser-only: relies on document.createElement('canvas'); won't run in Node without polyfills.",
              "A high scale raises resolution and cost: large pages can use a lot of memory.",
              "Multi-page bundling into a ZIP (with jszip) is left as an extension outside this snippet.",
              "The worker version must match the installed pdfjs-dist version.",
            ],
          },
        },
      ],
    },
  },
  {
    id: "compress-pdf",
    slug: "comprimir-pdf",
    slugEn: "compress-pdf",
    name: { es: "Comprimir PDF", en: "Compress PDF" },
    description: {
      es: "Intenta optimizar el tamaño de un PDF directamente desde el navegador.",
      en: "Attempts to optimize a PDF's size right from your browser.",
    },
    category: "pdf",
    tags: {
      es: ["pdf", "comprimir", "optimizar"],
      en: ["pdf", "compress", "optimize"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Comprimir PDF online gratis",
        description:
          "Intenta optimizar un PDF directamente en tu navegador y muestra el resultado real. La reducción depende del contenido del archivo.",
      },
      en: {
        title: "Compress PDF online free",
        description:
          "Attempts to optimize a PDF right in your browser and shows the real result. The reduction depends on the file's content.",
      },
    },
    doc: {
      es: {
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
          "La optimización se intenta en tu navegador. No recomprime imágenes ni garantiza reducción; el resultado depende de la estructura del PDF.",
        commonErrors: [
          "Un PDF protegido o encriptado no se puede comprimir desde la herramienta.",
          "Algunos PDF con estructuras poco comunes pueden no ser compatibles.",
        ],
        technicalNotes: [
          "Usa pdf-lib para optimizar la estructura del archivo; no recomprime las imágenes.",
          "Por eso la reducción es honesta y, en documentos ya livianos, puede ser mínima.",
        ],
      },
      en: {
        summary:
          "Compress PDF tries to shrink one or more PDFs by rewriting their internal structure, showing the real result per file.",
        howTo: [
          "Upload one or more PDFs.",
          "Check original size, final size, and the delta per file.",
          "Optional: edit the output file name.",
          "Download the result: a PDF if there's one, or a ZIP for several.",
        ],
        useCases: [
          "Trim a PDF to attach it to an email.",
          "Prep a document for sites with upload size limits.",
          "Optimize PDFs generated by other tools.",
        ],
        limits: [
          "Each file is up to 50 MB and the batch up to 100 MB total.",
          "The reduction depends on the content: an already-optimized PDF or one full of images may shrink little or not at all. In that case we keep the original.",
        ],
        privacy:
          "Optimization is attempted in your browser. It doesn't recompress images or guarantee shrinkage; the result depends on the PDF's structure.",
        commonErrors: [
          "An encrypted PDF can't be compressed from this tool.",
          "Some PDFs with unusual structures may not be compatible.",
        ],
        technicalNotes: [
          "Uses pdf-lib to optimize the file structure; it doesn't recompress images.",
          "That's why the reduction is honest and, for already-light documents, can be minimal.",
        ],
      },
    },
  },
  {
    id: "extract-pdf-text",
    slug: "extraer-texto-de-pdf",
    slugEn: "extract-pdf-text",
    name: { es: "Extraer texto de PDF", en: "Extract text from PDF" },
    description: {
      es: "Extrae texto seleccionable de un PDF para copiarlo o descargarlo.",
      en: "Pull selectable text from a PDF to copy or download.",
    },
    category: "pdf",
    tags: {
      es: ["pdf", "texto", "extraer"],
      en: ["pdf", "text", "extract"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Extraer texto de PDF online sin subir archivos",
        description:
          "Extraé texto seleccionable de un PDF para copiarlo o descargarlo como TXT. El procesamiento ocurre en tu navegador.",
      },
      en: {
        title: "Extract text from PDF online, no uploads",
        description:
          "Pull selectable text from a PDF to copy or download as TXT. Processing happens in your browser.",
      },
    },
    doc: {
      es: {
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
          "El procesamiento de este archivo ocurre en tu navegador; no lo subimos a Modulaq para extraer texto.",
        commonErrors: [
          "El PDF parece escaneado y no tiene texto seleccionable.",
          "Aparecen símbolos extraños cuando el PDF usa fuentes no estándar.",
        ],
        technicalNotes: [
          "Usa pdf.js para leer el contenido de texto.",
          "Detecta si el documento parece escaneado y avisa cuando hay símbolos problemáticos.",
        ],
      },
      en: {
        summary:
          "Extract text from PDF recovers selectable text from a document so you can copy it or download it as a TXT file.",
        howTo: [
          "Upload the PDF.",
          "Optional: toggle on preserving approximate line breaks to keep the layout closer.",
          "Review the text extracted per page.",
          "Copy the result or download it as TXT.",
        ],
        useCases: [
          "Reuse text from a document without retyping it.",
          "Quote or search content inside a PDF.",
          "Convert a document to plain text.",
        ],
        limits: [
          "Only selectable text is recovered; a scanned PDF (images) has no text to extract and the tool warns you about it.",
          "Max PDF size: 50 MB.",
        ],
        privacy:
          "Processing happens in your browser — we don't upload this file to Modulaq to extract text.",
        commonErrors: [
          "The PDF looks scanned and has no selectable text.",
          "Strange symbols show up when the PDF uses non-standard fonts.",
        ],
        technicalNotes: [
          "Uses pdf.js to read text content.",
          "Detects whether the document looks scanned and warns about problematic symbols.",
        ],
      },
    },
    integrableCode: {
      summary: {
        es: "Extraer texto usa pdfjs-dist en el navegador. El snippet incluye la configuración del worker para Vite; en las notas están las alternativas (workerPort y CDN).",
        en: "Text extraction uses pdfjs-dist in the browser. The snippet includes the worker setup for Vite; the notes cover the alternatives (workerPort and CDN).",
      },
      snippets: [
        {
          id: "extract-pdf-text-core",
          title: {
            es: "Extraer texto seleccionable de un PDF",
            en: "Extract selectable text from a PDF",
          },
          description: {
            es: "Devuelve el texto por página y unido. Orientado a Vite + navegador moderno.",
            en: "Returns text per page and joined. Aimed at Vite + a modern browser.",
          },
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
          usageNotes: {
            es: [
              "La config de worker de arriba es para Vite (import con ?url).",
              "Alternativa con bundler genérico (sin Vite): GlobalWorkerOptions.workerPort = new Worker(new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url), { type: 'module' }).",
              "Alternativa CDN: GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/<VERSION>/pdf.worker.min.mjs'.",
              "Usá result.pages para el texto por página o result.text para el texto unido.",
            ],
            en: [
              "The worker config above is for Vite (import with ?url).",
              "Generic bundler alternative (no Vite): GlobalWorkerOptions.workerPort = new Worker(new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url), { type: 'module' }).",
              "CDN alternative: GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/<VERSION>/pdf.worker.min.mjs'.",
              "Use result.pages for the per-page text or result.text for the joined text.",
            ],
          },
          limitations: {
            es: [
              "No hace OCR: solo extrae texto ya seleccionable. Un PDF escaneado (imágenes) puede devolver vacío.",
              "El orden y el espaciado son aproximados (sin reconstrucción de columnas ni saltos de línea de layout).",
              "La versión del worker debe coincidir con la versión de pdfjs-dist instalada.",
            ],
            en: [
              "It doesn't do OCR: it only extracts text that's already selectable. A scanned PDF (images) may return empty.",
              "Order and spacing are approximate (no column reconstruction or layout line breaks).",
              "The worker version must match the installed pdfjs-dist version.",
            ],
          },
        },
      ],
    },
  },
  {
    id: "pdf-page-counter",
    slug: "contador-de-paginas-pdf",
    slugEn: "pdf-page-counter",
    name: { es: "Contador de páginas PDF", en: "PDF page counter" },
    description: {
      es: "Lee un PDF y muestra la cantidad de páginas detectadas.",
      en: "Reads a PDF and shows the detected page count.",
    },
    category: "pdf",
    tags: {
      es: ["pdf", "paginas", "contador"],
      en: ["pdf", "pages", "counter"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Contar páginas de un PDF online",
        description:
          "Conocé cuántas páginas tiene un PDF al instante. La lectura del archivo ocurre en tu navegador.",
      },
      en: {
        title: "Count PDF pages online",
        description:
          "See how many pages a PDF has instantly. File reading happens in your browser.",
      },
    },
    doc: {
      es: {
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
          "La lectura de este archivo ocurre en tu navegador; no lo subimos a Modulaq para contar sus páginas.",
        commonErrors: [
          "El archivo no es un PDF válido.",
          "Un PDF protegido o dañado puede no poder leerse.",
        ],
        technicalNotes: ["Usa pdf-lib para leer la cantidad de páginas del documento."],
      },
      en: {
        summary:
          "PDF page counter shows how many pages a document has, along with its name and size.",
        howTo: [
          "Upload the PDF.",
          "You'll see the name, size, and detected page count.",
        ],
        useCases: [
          "Verify the page count before printing.",
          "Check a document you received.",
          "Confirm a PDF fits within a sending size limit.",
        ],
        limits: ["Max PDF size: 50 MB."],
        privacy:
          "Reading happens in your browser — we don't upload this file to Modulaq to count its pages.",
        commonErrors: [
          "The file isn't a valid PDF.",
          "An encrypted or damaged PDF may not be readable.",
        ],
        technicalNotes: ["Uses pdf-lib to read the document's page count."],
      },
    },
    integrableCode: {
      summary: {
        es: "Contar páginas es directo con pdf-lib: cargás el documento en memoria y leés getPageCount(). Corre en el navegador; instalá pdf-lib.",
        en: "Counting pages is straightforward with pdf-lib: load the document in memory and read getPageCount(). Runs in the browser; install pdf-lib.",
      },
      snippets: [
        {
          id: "pdf-page-counter-core",
          title: {
            es: "Contar páginas de un PDF",
            en: "Count pages in a PDF",
          },
          description: {
            es: "Carga un PDF en memoria y devuelve la cantidad de páginas.",
            en: "Loads a PDF in memory and returns the page count.",
          },
          language: "typescript",
          code: `import { PDFDocument } from "pdf-lib";

export async function countPdfPages(file: File): Promise<number> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return pdf.getPageCount();
}`,
          dependencies: ["pdf-lib"],
          usageNotes: {
            es: [
              "Recibe un File del navegador (por ejemplo desde un input de tipo file).",
              "Es asíncrona: usala con await o .then().",
            ],
            en: [
              "Takes a browser File (e.g. from a file input).",
              "It's async: use it with await or .then().",
            ],
          },
          limitations: {
            es: [
              "Un PDF protegido o dañado puede no poder leerse.",
              "Solo cuenta páginas; no extrae texto ni genera miniaturas.",
            ],
            en: [
              "An encrypted or damaged PDF may not be readable.",
              "It only counts pages; it doesn't extract text or generate thumbnails.",
            ],
          },
        },
      ],
    },
  },
  {
    id: "reorder-pdf-pages",
    slug: "reordenar-paginas-pdf",
    slugEn: "reorder-pdf-pages",
    name: { es: "Reordenar páginas PDF", en: "Reorder PDF pages" },
    description: {
      es: "Cambia el orden de las páginas de un PDF y descarga el documento reordenado.",
      en: "Change the order of pages in a PDF and download the reorganized document.",
    },
    category: "pdf",
    tags: {
      es: ["pdf", "paginas", "ordenar"],
      en: ["pdf", "pages", "reorder"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Reordenar páginas PDF online gratis",
        description:
          "Cambiá el orden de las páginas de un PDF y descargá el documento reorganizado. Funciona directamente en tu navegador.",
      },
      en: {
        title: "Reorder PDF pages online free",
        description:
          "Change the order of a PDF's pages and download the reorganized document. Runs right in your browser.",
      },
    },
    doc: {
      es: {
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
          "El procesamiento de este archivo ocurre en tu navegador; no lo subimos a Modulaq para reordenarlo.",
        commonErrors: [
          "Un PDF protegido o dañado puede no poder procesarse.",
          "Un orden inválido se valida y avisa antes de generar el archivo.",
        ],
        technicalNotes: [
          "Usa pdf-lib en el navegador.",
          "El documento resultante respeta el orden mostrado en la lista.",
        ],
      },
      en: {
        summary:
          "Reorder PDF pages changes the order of a document's pages and produces a reorganized PDF.",
        howTo: [
          "Upload the PDF.",
          "Move pages up or down until you have the order you want (or restore the original order).",
          "Optional: edit the output file name.",
          "Download the reordered PDF.",
        ],
        useCases: [
          "Fix pages that came out of order from a scan.",
          "Move a section to a different spot in the document.",
          "Reorganize a PDF before sending or printing it.",
        ],
        limits: [
          "Max PDF size: 50 MB.",
          "In this version reordering is done with up/down buttons (no thumbnails or drag-and-drop).",
        ],
        privacy:
          "Processing happens in your browser — we don't upload this file to Modulaq to reorder it.",
        commonErrors: [
          "An encrypted or damaged PDF may not be processable.",
          "An invalid order is validated and flagged before generating the file.",
        ],
        technicalNotes: [
          "Uses pdf-lib in the browser.",
          "The resulting document follows the order shown in the list.",
        ],
      },
    },
    integrableCode: {
      summary: {
        es: "Reordenar usa pdf-lib: copiás las páginas en el nuevo orden a un documento nuevo. Instalá pdf-lib.",
        en: "Reordering uses pdf-lib: you copy the pages in the new order into a new document. Install pdf-lib.",
      },
      snippets: [
        {
          id: "reorder-pdf-core",
          title: {
            es: "Reordenar páginas con un array de orden",
            en: "Reorder pages with an order array",
          },
          description: {
            es: "Recibe un array 1-based con todas las páginas en el nuevo orden y devuelve el PDF reorganizado.",
            en: "Takes a 1-based array with every page in the new order and returns the reorganized PDF.",
          },
          language: "typescript",
          code: `import { PDFDocument } from "pdf-lib";

// order: 1-based array with EVERY page in the new order, e.g. [3, 1, 2]
export async function reorderPdfPages(file: File, order: number[]): Promise<Uint8Array> {
  const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const result = await PDFDocument.create();
  const pages = await result.copyPages(source, order.map((n) => n - 1));
  pages.forEach((page) => result.addPage(page));
  return result.save();
}`,
          dependencies: ["pdf-lib"],
          usageNotes: {
            es: [
              "order debe incluir todas las páginas, cada una una sola vez. Para 3 páginas: [3, 1, 2].",
              "Para descargar, envolvé los bytes en un Blob de tipo application/pdf.",
            ],
            en: [
              "order must include every page exactly once. For 3 pages: [3, 1, 2].",
              "To download, wrap the bytes in a Blob of type application/pdf.",
            ],
          },
          limitations: {
            es: [
              "Si order no cubre todas las páginas o repite alguna, el resultado será incorrecto: validá antes.",
              "Un PDF protegido o dañado puede no poder procesarse.",
            ],
            en: [
              "If order doesn't cover every page or repeats any, the result will be incorrect: validate first.",
              "An encrypted or damaged PDF may not be processable.",
            ],
          },
        },
      ],
    },
  },
  {
    id: "text-cleaner",
    slug: "limpiador-de-texto",
    slugEn: "text-cleaner",
    name: { es: "Limpiador de texto", en: "Text cleaner" },
    description: {
      es: "Normaliza espacios, saltos de línea y contenido pegado desde distintas fuentes.",
      en: "Normalize spaces, line breaks, and content pasted from various sources.",
    },
    category: "text",
    tags: {
      es: ["texto", "limpieza", "productividad"],
      en: ["text", "cleanup", "productivity"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Limpiar y normalizar texto gratis",
        description:
          "Limpiá espacios, saltos de línea, comillas raras y caracteres invisibles. Gratis, sin instalar nada.",
      },
      en: {
        title: "Clean and normalize text for free",
        description:
          "Clean up spaces, line breaks, smart quotes, and invisible characters. Free, no install.",
      },
    },
    doc: {
      es: {
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
          "La limpieza del texto ocurre en tu navegador.",
        commonErrors: [
          "Esperar un cambio sin haber activado ninguna opción de limpieza.",
        ],
        technicalNotes: [
          "La lógica de limpieza vive en un módulo reutilizable y cada opción se aplica de forma independiente.",
        ],
      },
      en: {
        summary:
          "Text cleaner normalizes pasted text: removes extra spaces, extra line breaks, smart quotes, and invisible characters, with each cleanup you can toggle on or off.",
        howTo: [
          "Paste the text you want to clean.",
          "Pick which cleanups to apply (multiple spaces, extra line breaks, quotes, invisible characters, empty lines, etc.).",
          "Check the before/after stats: characters, words, and lines.",
          "Copy the result, download it as TXT, or feed it back as new input.",
        ],
        useCases: [
          "Clean text copied from a PDF or a web page.",
          "Normalize content before publishing it or pasting it into another tool.",
          "Strip leftover spaces and empty lines from a text.",
        ],
        limits: [
          "It works on text you paste; it doesn't open files.",
          "If you don't pick any cleanup, the text comes out unchanged.",
        ],
        privacy:
          "Text cleanup happens in your browser.",
        commonErrors: [
          "Expecting a change without enabling any cleanup option.",
        ],
        technicalNotes: [
          "The cleanup logic lives in a reusable module and each option is applied independently.",
        ],
      },
    },
    integrableCode: {
      summary: {
        es: "La limpieza es una función pura sin dependencias: recibe el texto y un objeto de opciones y devuelve el texto normalizado. Copiá la función y usala en cualquier proyecto JS/TS.",
        en: "Cleanup is a pure function with no dependencies: it takes the text plus an options object and returns the normalized text. Copy the function and use it in any JS/TS project.",
      },
      snippets: [
        {
          id: "text-cleaner-core",
          title: {
            es: "Función cleanText (sin dependencias)",
            en: "cleanText function (no dependencies)",
          },
          description: {
            es: "Normaliza saltos de línea, espacios múltiples, comillas tipográficas y caracteres invisibles. Cada limpieza se activa por opción.",
            en: "Normalizes line breaks, multiple spaces, smart quotes, and invisible characters. Each cleanup is toggled by option.",
          },
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
          usageNotes: {
            es: [
              "Pasá un objeto con todas las opciones en true para una limpieza completa, o desactivá las que no quieras.",
              "La función no muta el input: devuelve un texto nuevo.",
            ],
            en: [
              "Pass an object with every option set to true for a full cleanup, or turn off the ones you don't want.",
              "The function doesn't mutate the input: it returns a new string.",
            ],
          },
          limitations: {
            es: [
              "Trabaja sobre strings; no abre ni lee archivos.",
              "No corrige ortografía ni gramática, solo normaliza formato.",
            ],
            en: [
              "Works on strings; it doesn't open or read files.",
              "It doesn't fix spelling or grammar, only normalizes formatting.",
            ],
          },
        },
      ],
    },
  },
  {
    id: "qr-generator",
    slug: "generador-de-qr",
    slugEn: "qr-generator",
    name: { es: "Generador de QR", en: "QR generator" },
    description: {
      es: "Crea códigos QR simples para enlaces, texto o información breve.",
      en: "Create simple QR codes for links, text, or short info.",
    },
    category: "productivity",
    tags: {
      es: ["qr", "codigo", "productividad"],
      en: ["qr", "code", "productivity"],
    },
    modes: v11AvailableModes,
    plannedModes: v11PlannedModes,
    status: "active",
    pricing: "free",
    requiresBackend: false,
    requiresAI: false,
    apiStatus: "planned",
    seo: {
      es: {
        title: "Generador de códigos QR gratis",
        description:
          "Generá códigos QR para enlaces, texto, email o teléfono. Descargá en PNG, sin cuenta.",
      },
      en: {
        title: "Free QR code generator",
        description:
          "Generate QR codes for links, text, email, or phone. Download as PNG, no account needed.",
      },
    },
    doc: {
      es: {
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
          "El código QR se genera en tu navegador.",
        commonErrors: [
          "Email o URL con formato inválido: la validación visual te avisa antes de generar.",
          "Contenido demasiado largo: el QR resultante puede no ser legible por las cámaras.",
        ],
        technicalNotes: [
          "Usa la librería qrcode en el navegador.",
          "El tamaño seleccionado corresponde al PNG exportado, no solo a la vista previa.",
        ],
      },
      en: {
        summary:
          "QR generator creates QR codes from a link, text, email, or phone number, with an instant preview and PNG download at the size you pick.",
        howTo: [
          "Pick the content type: text, URL, email, or phone.",
          "Type the content. The QR is generated automatically when it's valid.",
          "Pick the output size: 256, 512, 1024 px, or a custom value.",
          "Optional: edit the file name.",
          "Download the code as PNG.",
        ],
        useCases: [
          "Share a link on a poster, slide, or flyer.",
          "Put your contact email or phone on a business card.",
          "Link to a menu, form, or online catalog.",
          "Generate a high-resolution QR (1024 px) for print.",
        ],
        limits: [
          "The QR is meant for links or short text; very long content produces dense codes that are hard to scan.",
          "Custom size is supported within reasonable bounds.",
        ],
        privacy:
          "The QR code is generated in your browser.",
        commonErrors: [
          "Email or URL with an invalid format: the on-screen validation warns you before generating.",
          "Content too long: the resulting QR may not be readable by cameras.",
        ],
        technicalNotes: [
          "Uses the qrcode library in the browser.",
          "The selected size applies to the exported PNG, not just the preview.",
        ],
      },
    },
    integrableCode: {
      summary: {
        es: "La generación se apoya en la librería qrcode. Construí el valor según el tipo de contenido y obtené un PNG en base64 (data URL) listo para mostrar o descargar.",
        en: "Generation relies on the qrcode library. Build the value based on the content type and get a base64 PNG (data URL) ready to display or download.",
      },
      snippets: [
        {
          id: "qr-generator-core",
          title: {
            es: "Generar un QR como data URL",
            en: "Generate a QR as a data URL",
          },
          description: {
            es: "Arma el valor del QR según el tipo (texto, URL, email o teléfono) y devuelve un PNG en base64.",
            en: "Builds the QR value based on the type (text, URL, email, or phone) and returns a base64 PNG.",
          },
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
          usageNotes: {
            es: [
              "Instalá la dependencia: npm i qrcode (y npm i -D @types/qrcode si usás TypeScript).",
              "El data URL se puede usar directo en el src de un <img> o convertir a Blob para descargar.",
            ],
            en: [
              "Install the dependency: npm i qrcode (and npm i -D @types/qrcode if you use TypeScript).",
              "The data URL can go directly into an <img> src or be converted to a Blob to download.",
            ],
          },
          limitations: {
            es: [
              "Contenidos muy largos generan QR densos y difíciles de escanear.",
              "Pensado para uso en navegador; en Node ajustá las opciones de salida.",
            ],
            en: [
              "Very long content produces dense QRs that are hard to scan.",
              "Aimed at browser use; for Node adjust the output options.",
            ],
          },
        },
      ],
    },
  },
];
