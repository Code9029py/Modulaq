import { ArrowRight, History } from "lucide-react";
import { Link } from "react-router-dom";
import { buildToolPath } from "../../../app/routes/routePaths";
import { Container } from "../../../shared/components/Container";
import type { ToolMetadata } from "../types/tool.types";
import { useRecentTools } from "../context/ToolPrefsProvider";
import { getToolById } from "../utils/getToolById";

export function RecentToolsSection() {
  const { recentIds } = useRecentTools();
  const recentTools = recentIds
    .map((id) => getToolById(id))
    .filter((tool): tool is ToolMetadata => Boolean(tool));

  if (recentTools.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-surface-200/70">
      <Container className="py-8">
        <div className="mb-4 flex items-center gap-2">
          <History size={18} className="text-accent-teal" />
          <h2 className="text-lg font-semibold text-ink-900">Usadas recientemente</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {recentTools.map((tool) => (
            <Link
              key={tool.id}
              to={buildToolPath(tool.slug)}
              className="group flex items-center justify-between gap-2 rounded-lg border border-surface-200 bg-surface-50/82 px-4 py-3 text-sm font-semibold text-ink-900 transition hover:border-accent-cyan/45 hover:shadow-sm"
            >
              <span className="truncate">{tool.name}</span>
              <ArrowRight size={16} className="shrink-0 text-ink-300 transition group-hover:text-accent-teal" />
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
