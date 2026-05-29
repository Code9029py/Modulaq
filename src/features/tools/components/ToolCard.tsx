import { ArrowRight, Braces, FileText, Image, Layers3, QrCode, Sparkles, Table2, Type } from "lucide-react";
import { Link } from "react-router-dom";
import { buildToolPath } from "../../../app/routes/routePaths";
import { getCategoryLabel } from "../../../config/categories";
import { pricingLabels } from "../../../config/pricing";
import type { ToolCategoryId, ToolMetadata } from "../types/tool.types";
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

function SmallBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-md border border-surface-200 bg-surface-100/80 px-2.5 py-1 text-xs font-semibold text-ink-700">
      {children}
    </span>
  );
}

export function ToolCard({ tool }: { tool: ToolMetadata }) {
  const Icon = categoryIcons[tool.category] ?? Layers3;

  return (
    <article className="group flex h-full flex-col rounded-lg border border-surface-200 bg-surface-50/82 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent-cyan/45 hover:shadow-panel">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-surface-200 bg-surface-100 text-accent-teal">
          <Icon size={18} />
        </div>
        <div className="flex items-center gap-1.5">
          <ToolStatusBadge status={tool.status} />
          <FavoriteToggleButton toolId={tool.id} toolName={tool.name} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <SmallBadge>{getCategoryLabel(tool.category)}</SmallBadge>
        <SmallBadge>{pricingLabels[tool.pricing]}</SmallBadge>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-ink-900">{tool.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-ink-500">{tool.description}</p>

      <div className="mt-5 border-t border-surface-200 pt-4">
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-ink-900 px-4 py-2 text-sm font-semibold text-surface-50 transition hover:bg-ink-700 focus:outline-none focus:ring-2 focus:ring-accent-cyan/25"
          to={buildToolPath(tool.slug)}
        >
          Ver herramienta
          <ArrowRight className="ml-2" size={16} />
        </Link>
      </div>
    </article>
  );
}
