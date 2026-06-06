import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { buildToolPathFor } from "../../../shared/i18n/paths";
import type { ToolDefinition } from "../types/tool.types";
import { useFavorites } from "../context/ToolPrefsProvider";
import { getToolById } from "../utils/getToolById";
import { localizeTool } from "../utils/localizeTool";

export function FavoriteToolsSection() {
  const { language, t } = useI18n();
  const { hydrated, favoriteIds } = useFavorites();

  if (!hydrated) {
    return null;
  }

  const favoriteTools = favoriteIds
    .map((id) => getToolById(id))
    .filter((tool): tool is ToolDefinition => Boolean(tool))
    .map((tool) => localizeTool(tool, language));

  if (favoriteTools.length === 0) {
    return null;
  }

  return (
    <section className="mt-5 rounded-xl border border-surface-200/80 bg-surface-50/90 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
      <div className="mb-3 flex items-center gap-2">
        <Star size={16} className="fill-current text-accent-teal" />
        <h2 className="text-sm font-semibold text-ink-900">{t("catalog.favorites.title")}</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
        {favoriteTools.map((tool) => (
          <Link
            key={tool.id}
            to={buildToolPathFor(tool, language)}
            className="group flex min-w-0 items-center justify-between gap-2 rounded-xl border border-surface-200/80 bg-surface-50/95 px-4 py-3 text-sm font-semibold text-ink-900 shadow-sm transition hover:-translate-y-0.5 hover:border-accent-cyan/40 hover:shadow-panel motion-reduce:hover:translate-y-0"
          >
            <span className="min-w-0 truncate">{tool.name}</span>
            <ArrowRight size={16} className="shrink-0 text-ink-300 transition group-hover:text-accent-teal" />
          </Link>
        ))}
      </div>
    </section>
  );
}
