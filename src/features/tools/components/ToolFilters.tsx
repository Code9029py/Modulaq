import { Star } from "lucide-react";
import type { TranslationKey } from "../../../shared/i18n/dictionaries/es";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { inputClassName } from "../../../shared/styles/inputClassName";
import { cn } from "../../../shared/utils/cn";
import type { ToolCategory, ToolCategoryId, ToolFilters as ToolFiltersType, ToolMode, ToolModeId, ToolStatus } from "../types/tool.types";

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

const chipBaseClass =
  "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-accent-cyan/30";
const chipIdleClass =
  "border-surface-200/80 bg-surface-50/90 text-ink-700 hover:border-accent-cyan/30 hover:bg-surface-50 hover:text-ink-900";
const chipActiveClass = "border-accent-cyan/40 bg-accent-cyan/10 text-accent-teal";

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

  const selectedCategorySet = new Set<ToolCategoryId>(filters.categories);
  const allCategoriesActive = selectedCategorySet.size === 0;

  const toggleCategory = (id: ToolCategoryId) => {
    const next = new Set(selectedCategorySet);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange({ ...filters, categories: Array.from(next) });
  };

  const clearCategories = () => {
    if (allCategoriesActive) return;
    onChange({ ...filters, categories: [] });
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

      <fieldset className="grid gap-2 text-sm font-semibold text-ink-700">
        <legend className="mb-1">{t("catalog.filters.category")}</legend>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={allCategoriesActive}
            aria-label={t("catalog.filters.categoryAllAria")}
            onClick={clearCategories}
            className={cn(chipBaseClass, allCategoriesActive ? chipActiveClass : chipIdleClass)}
          >
            {t("catalog.filters.categoryAll")}
          </button>
          {categories.map((category) => {
            const isActive = selectedCategorySet.has(category.id);
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => toggleCategory(category.id)}
                className={cn(chipBaseClass, isActive ? chipActiveClass : chipIdleClass)}
              >
                {t(`category.${category.id}` as TranslationKey)}
              </button>
            );
          })}
        </div>
      </fieldset>

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
