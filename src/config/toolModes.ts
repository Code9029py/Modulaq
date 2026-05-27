import type { ToolMode } from "../features/tools/types/tool.types";

export const toolModes: ToolMode[] = [
  {
    id: "online",
    label: "Usar online",
    plannedLabel: "Usar online (próximo)",
    description: "Interfaz web directa, sin instalación ni backend inicial.",
  },
  {
    id: "integrable-code",
    label: "Código integrable",
    plannedLabel: "Código integrable (próximo)",
    description: "Base futura para reutilizar lógica dentro de otros proyectos.",
  },
  {
    id: "api",
    label: "API",
    plannedLabel: "API (próxima)",
    description: "Contrato preparado para una API futura, sin endpoints reales todavía.",
  },
  {
    id: "documentation",
    label: "Documentación",
    plannedLabel: "Documentación (próxima)",
    description: "Espacio reservado para ejemplos, casos de uso e integración.",
  },
];

export function getToolModeLabel(modeId: ToolMode["id"]) {
  return toolModes.find((mode) => mode.id === modeId)?.label ?? modeId;
}

export function getPlannedToolModeLabel(modeId: ToolMode["id"]) {
  return toolModes.find((mode) => mode.id === modeId)?.plannedLabel ?? modeId;
}
