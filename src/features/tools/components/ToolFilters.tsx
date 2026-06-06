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
  filters: ToolFiltersType;
  modes: ToolMode[];
  onChange: (filters: ToolFiltersType) => void;
  statuses: ToolStatus[];
};

const controlClassName = inputClassName;

export function ToolFilters({ categories, className, filters, modes, onChange, statuses }: ToolFiltersProps) {
  const { t } = useI18n();

  const statusLabel = (status: ToolStatus) => {
    if (status === "active") return t("catalog.filters.status.active");
    if (status === "planned") return t("catalog.filters.status.planned");
    return t("catalog.filters.status.draft");
  };

  return (
    <div className={cn("grid gap-4", className)}>
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
