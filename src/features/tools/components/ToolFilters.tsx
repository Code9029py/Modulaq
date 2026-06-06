import { Star } from "lucide-react";
import type { TranslationKey } from "../../../shared/i18n/dictionaries/es";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { inputClassName } from "../../../shared/styles/inputClassName";
import { cn } from "../../../shared/utils/cn";
import type { ToolCategory, ToolFilters as ToolFiltersType, ToolMode, ToolModeId, ToolStatus } from "../types/tool.types";

const modeLabelKey: Record<ToolModeId, TranslationKey> = {
  online: "toolDetail.tabs.online",
  documentation: "toolDetail.tabs.documentation",
  "integrable-code": "toolDetail.tabs.integrableCode",
  api: "toolDetail.tabs.api",
};

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
  const { t } = useI18n();

  const statusLabel = (status: ToolStatus) => {
    if (status === "active") return t("catalog.filters.status.active");
    if (status === "planned") return t("catalog.filters.status.planned");
    return t("catalog.filters.status.draft");
  };

  return (
    <div className={cn("grid gap-4", className)}>
      {showFavoritesFilter && onOnlyFavoritesChange ? (
        <div className="grid gap-2 text-sm font-semibold text-ink-700">
          {t("catalog.favorites.title")}
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
              {t("catalog.favorites.toggle")}
            </span>
            <span className="shrink-0 text-xs font-medium text-ink-500">({favoriteCount})</span>
          </button>
        </div>
      ) : null}

      <label className="grid gap-2 text-sm font-semibold text-ink-700">
        {t("catalog.filters.category")}
        <select
          className={controlClassName}
          value={filters.category}
          onChange={(event) => onChange({ ...filters, category: event.target.value as ToolFiltersType["category"] })}
        >
          <option value="all">{t("catalog.filters.categoryAll")}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {t(`category.${category.id}` as TranslationKey)}
            </option>
          ))}
        </select>
      </label>

      {modes.length > 1 ? (
        <label className="grid gap-2 text-sm font-semibold text-ink-700">
          {t("catalog.filters.mode")}
          <select
            className={controlClassName}
            value={filters.mode}
            onChange={(event) => onChange({ ...filters, mode: event.target.value as ToolFiltersType["mode"] })}
          >
            <option value="all">{t("catalog.filters.modeAll")}</option>
            {modes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {t(modeLabelKey[mode.id])}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {statuses.length > 1 ? (
        <label className="grid gap-2 text-sm font-semibold text-ink-700">
          {t("catalog.filters.status")}
          <select
            className={controlClassName}
            value={filters.status}
            onChange={(event) => onChange({ ...filters, status: event.target.value as ToolFiltersType["status"] })}
          >
            <option value="all">{t("catalog.filters.statusAll")}</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  );
}
