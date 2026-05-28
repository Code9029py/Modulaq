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
  },
];
