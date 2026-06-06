import type { TranslationKey } from "../../../shared/i18n/dictionaries/es";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import type { ToolStatus } from "../types/tool.types";

const statusLabelKeys: Record<ToolStatus, TranslationKey> = {
  active: "catalog.filters.status.active",
  planned: "catalog.filters.status.planned",
  draft: "catalog.filters.status.draft",
};

export function ToolStatusBadge({ status }: { status: ToolStatus }) {
  const { t } = useI18n();
  return (
    <span className="inline-flex rounded-md border border-accent-cyan/18 bg-accent-cyan/10 px-2.5 py-1 text-xs font-semibold text-ink-700">
      {t(statusLabelKeys[status])}
    </span>
  );
}
