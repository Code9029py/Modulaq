import type { ToolStatus } from "../types/tool.types";

const statusLabels: Record<ToolStatus, string> = {
  active: "Activa",
  planned: "Planificada",
  draft: "Borrador",
};

export function ToolStatusBadge({ status }: { status: ToolStatus }) {
  return (
    <span className="inline-flex rounded-md border border-accent-cyan/18 bg-accent-cyan/10 px-2.5 py-1 text-xs font-semibold text-ink-700">
      {statusLabels[status]}
    </span>
  );
}
