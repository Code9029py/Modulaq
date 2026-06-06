import { ArrowRight, History } from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "../../../shared/components/Container";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { buildToolPathFor } from "../../../shared/i18n/paths";
import type { ToolDefinition } from "../types/tool.types";
import { useRecentTools } from "../context/ToolPrefsProvider";
import { getToolById } from "../utils/getToolById";
import { localizeTool } from "../utils/localizeTool";

export function RecentToolsSection() {
  const { language, t } = useI18n();
  const { recentIds } = useRecentTools();
  const recentTools = recentIds
    .map((id) => getToolById(id))
    .filter((tool): tool is ToolDefinition => Boolean(tool))
    .map((tool) => localizeTool(tool, language));

  if (recentTools.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-surface-200/40 bg-gradient-to-r from-surface-50/30 via-surface-50/10 to-surface-50/30">
      <Container className="py-10">
        <div className="mb-5 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-accent-cyan/10 text-accent-teal">
            <History size={18} />
          </span>
          <h2 className="text-lg font-semibold text-ink-900">{t("home.recent.title")}</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))]">
          {recentTools.map((tool) => (
            <Link
              key={tool.id}
              to={buildToolPathFor(tool, language)}
              className="group flex min-w-0 items-center justify-between gap-2 rounded-xl border border-surface-200/90 bg-surface-50/95 px-4 py-3 text-sm font-semibold text-ink-900 shadow-panel ring-1 ring-surface-50/80 transition hover:-translate-y-0.5 hover:border-accent-cyan/40 hover:bg-surface-50 hover:shadow-soft motion-reduce:hover:translate-y-0"
            >
              <span className="min-w-0 truncate">{tool.name}</span>
              <ArrowRight size={16} className="shrink-0 text-ink-300 transition group-hover:text-accent-teal" />
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
