import type { TranslationKey } from "../../../shared/i18n/dictionaries/es";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import type { ToolModeId } from "../types/tool.types";

const modeLabelKey: Record<ToolModeId, TranslationKey> = {
  online: "toolDetail.tabs.online",
  documentation: "toolDetail.tabs.documentation",
  "integrable-code": "toolDetail.tabs.integrableCode",
  api: "toolDetail.tabs.api",
};

export function ToolModeBadge({ mode }: { mode: ToolModeId }) {
  const { t } = useI18n();

  return (
    <span className="inline-flex rounded-md border border-surface-200/80 bg-surface-50/90 px-2.5 py-1 text-xs font-semibold text-ink-700 shadow-sm">
      {t(modeLabelKey[mode])}
    </span>
  );
}
