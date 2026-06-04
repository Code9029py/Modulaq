import { Star } from "lucide-react";
import { inputClassName } from "../../../shared/styles/inputClassName";
import { cn } from "../../../shared/utils/cn";
import type { ToolCategory, ToolFilters as ToolFiltersType, ToolMode, ToolStatus } from "../types/tool.types";

type ToolFiltersProps = {
  categories: ToolCategory[];
  className?: string;
  favoriteCount?: number;
  filters: ToolFiltersType;
  modes: ToolMode[];
  onChange: (filters: ToolFiltersType) => void;
  onOnlyFavoritesChange?: (onlyFavorites: boolean) => void;
  onlyFavorites?: boolean;
  showFavoritesFilter?: boolean;
  statuses: ToolStatus[];
};

const controlClassName = inputClassName;

const statusLabels: Record<ToolStatus, string> = {
  active: "Activa",
  planned: "Planificada",
  draft: "Borrador",
};

export function ToolFilters({
  categories,
  className,
  favoriteCount = 0,
  filters,
  modes,
  onChange,
  onOnlyFavoritesChange,
  onlyFavorites = false,
  showFavoritesFilter = false,
  statuses,
}: ToolFiltersProps) {
  return (
    <div className={cn("grid gap-4", className)}>
      {showFavoritesFilter && onOnlyFavoritesChange ? (
        <div className="grid gap-2 text-sm font-semibold text-ink-700">
          Favoritos
          <button
            type="button"
            aria-pressed={onlyFavorites}
            onClick={() => onOnlyFavoritesChange(!onlyFavorites)}
            className={cn(
              "inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-accent-cyan/25",
              onlyFavorites
                ? "border-accent-cyan/40 bg-accent-cyan/10 text-accent-teal"
                : "border-surface-200/80 bg-surface-50/90 text-ink-700 hover:border-accent-cyan/30 hover:bg-surface-50 hover:text-ink-900",
            )}
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              <Star size={16} className={cn(onlyFavorites && "fill-current")} />
              Solo favoritos
            </span>
            <span className="shrink-0 text-xs font-medium text-ink-500">({favoriteCount})</span>
          </button>
        </div>
      ) : null}

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
