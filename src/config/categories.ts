import type { ToolCategory } from "../features/tools/types/tool.types";

export const categories: ToolCategory[] = [
  {
    id: "documents",
    label: "Documentos",
    description: "Utilidades para archivos, documentos y flujos de trabajo cotidianos.",
  },
  {
    id: "pdf",
    label: "PDF",
    description: "Herramientas enfocadas en manipulación, lectura y preparación de PDFs.",
  },
  {
    id: "text",
    label: "Texto",
    description: "Procesamiento simple de contenido escrito, limpieza y transformación.",
  },
  {
    id: "data",
    label: "Datos",
    description: "Conversión, revisión y preparación de estructuras de datos.",
  },
  {
    id: "image",
    label: "Imagen",
    description: "Utilidades para preparar, convertir y optimizar recursos visuales.",
  },
  {
    id: "development",
    label: "Desarrollo",
    description: "Herramientas técnicas para integrar, probar y acelerar proyectos.",
  },
  {
    id: "ai",
    label: "IA",
    description: "Herramientas futuras con asistencia de inteligencia artificial.",
  },
  {
    id: "productivity",
    label: "Productividad",
    description: "Microherramientas rápidas para tareas prácticas y repetibles.",
  },
];

export function getCategoryLabel(categoryId: ToolCategory["id"]) {
  return categories.find((category) => category.id === categoryId)?.label ?? categoryId;
}
