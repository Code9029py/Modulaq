import { ArrowRight, Braces, FileText, Image, Layers3, QrCode, Sparkles, Table2, Type } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Tag } from "../../../shared/components/Tag";
import type { TranslationKey } from "../../../shared/i18n/dictionaries/es";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { buildToolPathFor } from "../../../shared/i18n/paths";
import type { ToolCategoryId, ToolDefinition } from "../types/tool.types";
import { useTool } from "../utils/localizeTool";
import { FavoriteToggleButton } from "./FavoriteToggleButton";
import { ToolStatusBadge } from "./ToolStatusBadge";

const categoryIcons: Record<ToolCategoryId, typeof FileText> = {
  documents: FileText,
  pdf: FileText,
  text: Type,
  data: Table2,
  image: Image,
  development: Braces,
  ai: Sparkles,
  productivity: QrCode,
};

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  const { language, t } = useI18n();
  const localized = useTool(tool);
  const Icon = categoryIcons[localized.category] ?? Layers3;
  const href = buildToolPathFor(localized, language);

  return (
    <article className="group flex h-full flex-col rounded-xl border border-surface-200/80 bg-gradient-to-br from-surface-50/95 to-surface-100/60 p-5 shadow-sm ring-1 ring-surface-50/70 transition hover:-translate-y-0.5 hover:border-accent-cyan/40 hover:from-surface-50 hover:to-surface-50/90 hover:shadow-soft motion-reduce:hover:translate-y-0">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-surface-200/80 bg-surface-50 text-accent-teal shadow-sm transition group-hover:border-accent-cyan/30 group-hover:bg-accent-cyan/10">
          <Icon size={18} />
        </div>
        <div className="flex items-center gap-1.5">
          <ToolStatusBadge status={localized.status} />
          <FavoriteToggleButton toolId={localized.id} toolName={localized.name} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Tag>{t(`category.${localized.category}` as TranslationKey)}</Tag>
        <Tag>{t(`toolDetail.pricing.${localized.pricing}` as TranslationKey)}</Tag>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-ink-900">{localized.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-ink-500">{localized.description}</p>

      <div className="mt-5 border-t border-surface-200/80 pt-4">
        <Button href={href}>
          {t("catalog.toolCard.cta")}
          <ArrowRight className="ml-2" size={16} />
        </Button>
      </div>
    </article>
  );
}
