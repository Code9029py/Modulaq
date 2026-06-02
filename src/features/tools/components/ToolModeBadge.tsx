import { getToolModeLabel } from "../../../config/toolModes";
import type { ToolModeId } from "../types/tool.types";

export function ToolModeBadge({ mode }: { mode: ToolModeId }) {
  return (
    <span className="inline-flex rounded-md border border-surface-200/80 bg-surface-50/90 px-2.5 py-1 text-xs font-semibold text-ink-700 shadow-sm">
      {getToolModeLabel(mode)}
    </span>
  );
}
