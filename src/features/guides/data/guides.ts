import type { Guide } from "../types/guide.types";

/**
 * Registro de guías editoriales. Cada guía es single-language (no hay pares
 * 1:1 ES/EN): el contenido se elige por intención y baja competencia, no por
 * simetría. El enlazado a herramientas se hace por id (se resuelve nombre y
 * ruta localizada en render).
 */
export const guides: Guide[] = [
  // --- ES 1: Unir PDFs sin subir archivos ---
  {
    id: "unir-pdf-sin-subir-archivos",
    language: "es",
    slug: "unir-pdf-sin-subir-archivos",
    seoTitle: "Cómo unir PDFs sin subir archivos",
    seoDescription:
      "Guía para combinar varios PDF en uno solo directamente en tu navegador, sin subirlos a ningún servidor. Pasos, límites y herramientas relacionadas.",
    h1: "Cómo unir PDFs sin subir archivos",
    lead: "Combinar varios PDF en un único documento no debería obligarte a subir tus archivos a un servidor desconocido. Te explicamos cómo hacerlo de forma local, en tu propio navegador.",
    primaryToolId: "merge-pdf",
    sections: [
      {
        heading: "Qué significa unir PDFs de forma local",
        blocks: [
          {
            kind: "p",
            text: "Unir PDFs es tomar dos o más documentos y combinarlos en un solo archivo, en el orden que vos decidas. La mayoría de los servicios online hacen esto subiendo tus archivos a sus servidores, procesándolos allí y devolviéndote el resultado.",
          },
          {
            kind: "p",
            text: "Una herramienta local hace lo mismo, pero el proceso ocurre dentro de tu navegador. Tus PDF nunca salen de tu equipo: se leen en memoria, se combinan y se descarga el resultado. No hay subida, no hay copia en un servidor ajeno y no hace falta crear una cuenta.",
          },
        ],
      },
      {
        heading: "Por qué evitar subir tus archivos",
        blocks: [
          {
            kind: "p",
            text: "Un PDF puede contener mucho más de lo que parece: contratos, datos personales, información médica, presupuestos o documentos internos de tu trabajo. Cada vez que subís un archivo a un servicio externo, dependés de su política de retención, de cuánto tiempo guarda los datos y de qué hace realmente con ellos.",
          },
          {
            kind: "p",
            text: "Procesar localmente elimina esa incógnita en el origen: si el archivo no se sube, no hay nada que retener ni que filtrar. Para tareas rápidas con documentos sensibles, es la opción más simple y predecible.",
          },
        ],
      },
      {
        heading: "Pasos para unir PDFs",
        blocks: [
          {
            kind: "steps",
            items: [
              "Abrí la herramienta Unir PDFs.",
              "Seleccioná o arrastrá los archivos que querés combinar.",
              "Ordená los documentos en la secuencia final que necesitás.",
              "Descargá el PDF combinado. El resultado se genera en tu navegador.",
            ],
          },
        ],
      },
      {
        heading: "Límites honestos",
        blocks: [
          {
            kind: "p",
            text: "El procesamiento local depende de la memoria de tu equipo y del navegador. Conviene tenerlo en cuenta en estos casos:",
          },
          {
            kind: "list",
            items: [
              "Un PDF protegido con contraseña o cifrado puede no poder combinarse hasta que quites la protección.",
              "Archivos muy grandes o muchos documentos a la vez pueden tardar más o exigir bastante memoria.",
              "Algunos PDF con estructuras internas poco comunes pueden necesitar una segunda revisión del resultado.",
            ],
          },
        ],
      },
    ],
    relatedToolIds: ["split-pdf", "reorder-pdf-pages", "remove-pdf-pages", "rotate-pdf"],
    conclusion:
      "Unir PDFs localmente es rápido, gratuito y mantiene tus documentos en tu equipo. Revisá siempre el archivo final antes de compartirlo, sobre todo si combinás documentos de distintas fuentes.",
  },

  // --- ES 2: Eliminar páginas de un PDF online ---
  {
    id: "eliminar-paginas-pdf-online",
    language: "es",
    slug: "eliminar-paginas-pdf-online",
    seoTitle: "Cómo eliminar páginas de un PDF online",
    seoDescription:
      "Aprendé a quitar páginas o rangos de un PDF directamente en tu navegador, sin subir el documento. Cuándo conviene, cómo elegir páginas y qué revisar.",
    h1: "Cómo eliminar páginas de un PDF online",
    lead: "A veces un PDF trae páginas que sobran: una carátula, hojas en blanco, anexos que no querés compartir. Quitarlas no debería implicar subir el documento entero a un servidor.",
    primaryToolId: "remove-pdf-pages",
    sections: [
      {
        heading: "Cuándo conviene eliminar páginas",
        blocks: [
          {
            kind: "p",
            text: "Eliminar páginas es útil cuando querés compartir solo una parte de un documento o limpiar un archivo antes de enviarlo. Algunos casos frecuentes:",
          },
          {
            kind: "list",
            items: [
              "Quitar carátulas, publicidad o páginas de cortesía de un PDF descargado.",
              "Eliminar hojas en blanco que quedaron tras un escaneo.",
              "Retirar anexos confidenciales antes de mandar el documento a un tercero.",
            ],
          },
        ],
      },
      {
        heading: "Privacidad al trabajar con documentos",
        blocks: [
          {
            kind: "p",
            text: "Si el PDF tiene información que no querés que circule, lo más prudente es procesarlo sin subirlo. Una herramienta local lee el archivo en tu navegador, arma una versión sin las páginas indicadas y te la descarga. El documento original no viaja a ningún servidor.",
          },
        ],
      },
      {
        heading: "Cómo elegir páginas o rangos",
        blocks: [
          {
            kind: "steps",
            items: [
              "Abrí la herramienta Eliminar páginas de PDF y cargá tu archivo.",
              'Indicá las páginas a quitar con números y rangos, por ejemplo "1,3-5,8".',
              "Generá el PDF resultante y descargalo.",
            ],
          },
          {
            kind: "p",
            text: "La herramienta valida lo que escribís contra el total real de páginas, así que no podés eliminar páginas que no existen ni quitar el documento entero por error.",
          },
        ],
      },
      {
        heading: "Revisá antes de compartir y conocé los límites",
        blocks: [
          {
            kind: "p",
            text: "Después de eliminar páginas, abrí el resultado y confirmá que quedó exactamente lo que querías, sobre todo si el PDF era largo. Tené en cuenta también que:",
          },
          {
            kind: "list",
            items: [
              "El resultado siempre conserva al menos una página: no se permite vaciar el documento.",
              "Un PDF cifrado puede requerir que quites la protección antes de editarlo.",
              "Documentos con estructuras complejas pueden necesitar una verificación visual extra.",
            ],
          },
        ],
      },
    ],
    relatedToolIds: ["reorder-pdf-pages", "add-page-numbers", "rotate-pdf", "merge-pdf"],
    conclusion:
      "Quitar páginas de un PDF es una de esas tareas chicas que se resuelven mejor en local: rápido, sin cuenta y sin que el documento salga de tu equipo.",
  },

  // --- ES 3: Numerar páginas de un PDF ---
  {
    id: "numerar-paginas-pdf",
    language: "es",
    slug: "numerar-paginas-pdf",
    seoTitle: "Cómo numerar páginas de un PDF",
    seoDescription:
      "Guía para agregar numeración a las páginas de un PDF en tu navegador: para qué sirve, casos de uso, formatos y cómo dejar la portada sin numerar.",
    h1: "Cómo numerar páginas de un PDF",
    lead: "Numerar las páginas de un PDF facilita citar, ordenar e imprimir un documento. Podés hacerlo de forma local, sin subir el archivo a ningún lado.",
    primaryToolId: "add-page-numbers",
    sections: [
      {
        heading: "Para qué sirve numerar páginas",
        blocks: [
          {
            kind: "p",
            text: "La numeración da una referencia estable a cada hoja. Es la diferencia entre decir \"mirá la página 14\" y tener que describir dónde está algo. En documentos largos o que pasan por varias manos, esa referencia ahorra mucho tiempo.",
          },
          {
            kind: "list",
            items: [
              "Trabajos académicos y monografías que exigen paginación.",
              "Informes y reportes que se citan por número de página.",
              "Expedientes y documentación legal que necesita foliado claro.",
              "Borradores que vas a revisar en equipo y comentar por página.",
            ],
          },
        ],
      },
      {
        heading: "Formatos y posición",
        blocks: [
          {
            kind: "p",
            text: "Según el documento, te puede convenir un número simple o un formato más explícito. La herramienta ofrece varias opciones de formato (por ejemplo \"n\", \"n / total\" o \"Página n\") y te deja elegir la posición de la numeración al pie.",
          },
          {
            kind: "p",
            text: "Un caso típico: dejar la portada sin numerar. Para eso podés empezar la numeración en la página 2 con el número inicial 1, de modo que la primera hoja quede limpia y la cuenta arranque en el contenido real.",
          },
        ],
      },
      {
        heading: "Cómo numerar tu PDF",
        blocks: [
          {
            kind: "steps",
            items: [
              "Abrí la herramienta Numerar páginas de PDF y cargá el archivo.",
              "Elegí el formato, la posición y desde qué página empezar.",
              "Generá el PDF numerado y descargalo.",
            ],
          },
        ],
      },
      {
        heading: "Revisión y límites",
        blocks: [
          {
            kind: "p",
            text: "Revisá un par de páginas del resultado para confirmar que la numeración quedó donde esperabas y que no se superpone con el contenido existente. Recordá que:",
          },
          {
            kind: "list",
            items: [
              "La numeración se agrega al pie; si el documento ya tiene números propios, vas a ver ambos.",
              "Un PDF cifrado puede no poder modificarse hasta quitar la protección.",
              "El procesamiento ocurre en tu navegador y depende de la memoria de tu equipo.",
            ],
          },
        ],
      },
    ],
    relatedToolIds: ["remove-pdf-pages", "reorder-pdf-pages", "rotate-pdf"],
    conclusion:
      "Numerar un PDF es un toque final que mejora cualquier documento serio. Hacerlo en local te deja control total sobre el archivo, sin subirlo a un servicio externo.",
  },

  // --- ES 4: Procesamiento local (guía de confianza/marca) ---
  {
    id: "procesamiento-local-herramientas-online",
    language: "es",
    slug: "procesamiento-local-herramientas-online",
    seoTitle: "Qué significa procesamiento local en herramientas online",
    seoDescription:
      "Explicación clara de qué es el procesamiento local en el navegador, en qué se diferencia de subir archivos a un servidor, sus ventajas y sus límites reales.",
    h1: "Qué significa procesamiento local en herramientas online",
    lead: "\"Procesamiento local\" aparece cada vez más en herramientas web, pero rara vez se explica bien. Acá va qué significa en concreto, qué te aporta y qué no deberías esperar de él.",
    primaryToolId: "merge-pdf",
    sections: [
      {
        heading: "Qué quiere decir que algo se procesa en el navegador",
        blocks: [
          {
            kind: "p",
            text: "Una herramienta web puede resolver una tarea de dos maneras. La primera es enviar tu archivo a un servidor, procesarlo allí y devolverte el resultado. La segunda es ejecutar todo el trabajo dentro de tu navegador, usando el procesador y la memoria de tu propio equipo.",
          },
          {
            kind: "p",
            text: "Cuando una herramienta procesa localmente, tu archivo no se sube: se abre en memoria, se transforma y se descarga el resultado, todo en tu dispositivo. La página web es solo el programa que hace el trabajo; los datos no la atraviesan hacia un servidor.",
          },
        ],
      },
      {
        heading: "Subir a un servidor vs. procesar localmente",
        blocks: [
          {
            kind: "list",
            items: [
              "Subir a un servidor: el archivo viaja por la red, se procesa fuera de tu equipo y queda sujeto a la política de retención del servicio.",
              "Procesar localmente: el archivo se queda en tu dispositivo; no hay subida, ni copia remota, ni espera por la red.",
            ],
          },
        ],
      },
      {
        heading: "Ventajas concretas",
        blocks: [
          {
            kind: "list",
            items: [
              "Privacidad: si el archivo no se sube, no hay nada que un servidor pueda almacenar o exponer.",
              "Rapidez: sin subida ni descarga desde un servidor, las tareas chicas son casi instantáneas.",
              "Sin fricción: no hace falta crear una cuenta ni iniciar sesión para usar las herramientas públicas.",
            ],
          },
        ],
      },
      {
        heading: "Qué NO significa procesamiento local",
        blocks: [
          {
            kind: "p",
            text: "Ser honesto también es marcar los límites. Procesamiento local no es sinónimo de seguridad absoluta:",
          },
          {
            kind: "list",
            items: [
              "El rendimiento depende de tu navegador y tu equipo: archivos muy grandes pueden tardar o consumir mucha memoria.",
              "No reemplaza tus buenas prácticas: un equipo comprometido sigue siendo un riesgo, lo procese local o no.",
              "Algunos formatos complejos o cifrados pueden no ser totalmente compatibles.",
              "No es una promesa de cifrado ni de borrado garantizado: simplemente, el archivo no se envía a un servidor para esta operación.",
            ],
          },
        ],
      },
    ],
    relatedToolIds: ["merge-pdf", "image-converter", "image-to-base64", "text-to-pdf", "qr-generator"],
    conclusion:
      "El procesamiento local es una decisión de diseño a favor de tu privacidad y tu tiempo, no un eslogan. En Modulaq las herramientas trabajan en tu navegador siempre que es posible, y te avisamos cuando una operación tiene límites.",
  },

  // --- EN 5: Image to Base64 and back ---
  {
    id: "image-base64",
    language: "en",
    slug: "image-base64",
    seoTitle: "Image to Base64 and back: a practical guide",
    seoDescription:
      "What Base64 image encoding is, when developers use data URLs, and how to convert an image to Base64 and decode it back — all locally in your browser.",
    h1: "Image to Base64 and back",
    lead: "Base64 lets you embed an image directly inside code instead of linking to a separate file. Here's what that means in practice, when it helps, and how to convert in both directions.",
    primaryToolId: "image-to-base64",
    sections: [
      {
        heading: "What Base64 is, in practical terms",
        blocks: [
          {
            kind: "p",
            text: "Base64 is a way of representing binary data — like an image — using only plain text characters. An image becomes a long string you can paste into HTML, CSS, JSON or a JavaScript file. Wrapped as a data URL (data:image/png;base64,...), the browser renders it as if it were a normal image file.",
          },
        ],
      },
      {
        heading: "When developers use image data URLs",
        blocks: [
          {
            kind: "p",
            text: "Inlining an image as Base64 trades an extra network request for a larger file. That trade-off pays off in specific situations:",
          },
          {
            kind: "list",
            items: [
              "Tiny icons or logos that would otherwise be separate HTTP requests.",
              "Self-contained HTML emails or single-file demos where external assets are awkward.",
              "Embedding a small image in a CSS background or a JSON payload.",
              "Avoiding a flash of missing image for a critical, very small asset.",
            ],
          },
        ],
      },
      {
        heading: "How to convert an image to Base64",
        blocks: [
          {
            kind: "steps",
            items: [
              "Open the Image to Base64 tool.",
              "Select or drop the image you want to encode.",
              "Copy the resulting Base64 string or data URL and paste it into your code.",
            ],
          },
        ],
      },
      {
        heading: "How to decode Base64 back to an image",
        blocks: [
          {
            kind: "p",
            text: "The reverse is just as common: you have a Base64 string and want to see or save the actual image. Paste the string into the Base64 to image tool and download the decoded file. It works with raw Base64 and with full data URLs.",
          },
        ],
      },
      {
        heading: "Privacy and limitations",
        blocks: [
          {
            kind: "p",
            text: "Both conversions run in your browser — the image is never uploaded to a server. A few honest caveats:",
          },
          {
            kind: "list",
            items: [
              "Base64 makes a file roughly a third larger, so it's a poor fit for big images.",
              "Long strings are hard to read and bloat your source; prefer it for small assets.",
              "Very large images can use significant browser memory while encoding.",
            ],
          },
        ],
      },
    ],
    relatedToolIds: ["base64-to-image", "svg-to-png", "image-to-favicon", "image-converter"],
    conclusion:
      "Base64 is a handy tool when used for the right job: small, self-contained assets. For everything else, a normal image file is still the better choice.",
  },

  // --- EN 6: Create a favicon from an image ---
  {
    id: "create-favicon-from-image",
    language: "en",
    slug: "create-favicon-from-image",
    seoTitle: "How to create a favicon from an image",
    seoDescription:
      "A practical guide to turning an image into a favicon: what a favicon is, what source image to use, how to generate it, and the common mistakes to avoid.",
    h1: "How to create a favicon from an image",
    lead: "A favicon is the small icon that represents your site in browser tabs, bookmarks and history. Turning an image into one is quick — if you start from the right source.",
    primaryToolId: "image-to-favicon",
    sections: [
      {
        heading: "What a favicon is",
        blocks: [
          {
            kind: "p",
            text: "The favicon is the tiny icon next to a page's title in a browser tab. It also shows up in bookmarks, history and search suggestions. Because it's displayed at very small sizes, a good favicon reads clearly even when it's only a handful of pixels wide.",
          },
        ],
      },
      {
        heading: "What source image to use",
        blocks: [
          {
            kind: "p",
            text: "The quality of a favicon is decided before you generate it, by the image you start from:",
          },
          {
            kind: "list",
            items: [
              "Use a square image so it isn't stretched or cropped awkwardly.",
              "Start from something reasonably large (for example 512×512) and let it scale down.",
              "Favor a simple, high-contrast mark over detailed artwork — detail disappears at small sizes.",
              "Decide whether you want a transparent or a solid background before exporting.",
            ],
          },
        ],
      },
      {
        heading: "How to generate the favicon",
        blocks: [
          {
            kind: "steps",
            items: [
              "Open the Favicon generator tool.",
              "Select your square source image.",
              "Generate and download the favicon, then add it to your site.",
            ],
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            kind: "list",
            items: [
              "Starting from a tiny source image, which produces a blurry result that can't be recovered.",
              "Using a full logo with text — wordmarks become unreadable at favicon size.",
              "Forgetting that a transparent background will show the tab's color behind it.",
              "Packing in fine detail that simply vanishes once scaled down.",
            ],
          },
        ],
      },
      {
        heading: "Privacy",
        blocks: [
          {
            kind: "p",
            text: "The conversion happens in your browser; your source image isn't uploaded to a server. You can generate a favicon from a private logo or draft without it leaving your device.",
          },
        ],
      },
    ],
    relatedToolIds: ["image-resizer", "image-converter", "svg-to-png"],
    conclusion:
      "A clear, square, high-contrast source image is most of the work. Get that right and generating the favicon itself takes seconds.",
  },
];
