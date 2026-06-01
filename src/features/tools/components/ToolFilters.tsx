import { cn } from "../../../shared/utils/cn";
import type { ToolCategory, ToolFilters as ToolFiltersType, ToolMode, ToolStatus } from "../types/tool.types";

type ToolFiltersProps = {
  categories: ToolCategory[];
  className?: string;
  filters: ToolFiltersType;
  modes: ToolMode[];
  onChange: (filters: ToolFiltersType) => void;
  statuses: ToolStatus[];
};

const controlClassName =
  "min-h-11 rounded-lg border border-surface-200/90 bg-surface-50/95 px-3 text-sm font-normal text-ink-900 shadow-sm outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:bg-surface-50 focus:ring-2 focus:ring-accent-cyan/20";

const statusLabels: Record<ToolStatus, string> = {
  active: "Activa",
  planned: "Planificada",
  draft: "Borrador",
};

export function ToolFilters({ categories, className, filters, modes, onChange, statuses }: ToolFiltersProps) {
  return (
    <div className={cn("grid gap-4", className)}>
      <label className="grid gap-2 text-sm font-semibold text-ink-700">
        Categoría
        <select
          className={controlClassName}
          value={filters.category}
          onChange={(event) => onChange({ ...filters, category: event.target.value as ToolFiltersType["category"] })}
        >
          <option value="all">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </label>

      {modes.length > 1 ? (
        <label className="grid gap-2 text-sm font-semibold text-ink-700">
          Modo disponible
          <select
            className={controlClassName}
            value={filters.mode}
            onChange={(event) => onChange({ ...filters, mode: event.target.value as ToolFiltersType["mode"] })}
          >
            <option value="all">Todos</option>
            {modes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {statuses.length > 1 ? (
        <label className="grid gap-2 text-sm font-semibold text-ink-700">
          Estado
          <select
            className={controlClassName}
            value={filters.status}
            onChange={(event) => onChange({ ...filters, status: event.target.value as ToolFiltersType["status"] })}
          >
            <option value="all">Todos</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  );
}
