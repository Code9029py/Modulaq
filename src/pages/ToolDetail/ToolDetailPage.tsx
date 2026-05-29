import { ArrowLeft, Braces, FileText, Globe2, Server } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ClientOnly } from "vite-react-ssg";
import { buildToolPath, routePaths } from "../../app/routes/routePaths";
import { getCategoryLabel } from "../../config/categories";
import { pricingLabels } from "../../config/pricing";
import { getPlannedToolModeLabel, getToolModeLabel } from "../../config/toolModes";
import { CodeSnippetPanel } from "../../features/tools/components/CodeSnippetPanel";
import { FavoriteToggleButton } from "../../features/tools/components/FavoriteToggleButton";
import { ToolDocPanel } from "../../features/tools/components/ToolDocPanel";
import { useRecentTools } from "../../features/tools/context/ToolPrefsProvider";
import { ToolStatusBadge } from "../../features/tools/components/ToolStatusBadge";
import { getToolRenderer } from "../../features/tools/renderers/toolRenderers";
import type { ToolModeId } from "../../features/tools/types/tool.types";
import { getToolBySlug } from "../../features/tools/utils/getToolBySlug";
import { Button } from "../../shared/components/Button";
import { Container } from "../../shared/components/Container";
import { PageHead } from "../../shared/seo/PageHead";
import { cn } from "../../shared/utils/cn";

type DetailTab = {
  id: ToolModeId;
  icon: typeof Globe2;
};

const detailTabs: DetailTab[] = [
  { id: "online", icon: Globe2 },
  { id: "integrable-code", icon: Braces },
  { id: "api", icon: Server },
  { id: "documentation", icon: FileText },
];

function ComingSoonPanel({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-dashed border-surface-200 bg-surface-100/70 p-6 text-center">
      <p className="text-sm font-semibold text-ink-900">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">
        Próximamente: este apartado quedará disponible cuando la herramienta avance de fase.
      </p>
    </div>
  );
}

function ToolLoadingPanel() {
  return (
    <div
      aria-live="polite"
      className="rounded-lg border border-surface-200 bg-surface-100/70 p-6 text-center text-sm font-semibold text-ink-700"
      role="status"
    >
      Cargando herramienta...
    </div>
  );
}

export function ToolDetailPage() {
  const { slug } = useParams();
  const tool = getToolBySlug(slug);
  const [activeTab, setActiveTab] = useState<ToolModeId>("online");
  const { recordVisit, hydrated } = useRecentTools();

  useEffect(() => {
    if (tool && hydrated) {
      recordVisit(tool.id);
    }
  }, [tool, hydrated, recordVisit]);

  if (!tool) {
    return (
      <Container className="py-16">
        <PageHead
          noindex
          title="Herramienta no encontrada"
          description="La herramienta solicitada no existe en Modulaq. Revisá el catálogo de microherramientas disponibles."
          path="/herramientas"
        />
        <div className="rounded-lg border border-surface-200 bg-surface-50/82 p-8 shadow-panel">
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-700">Herramienta no encontrada</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink-900">Esa herramienta todavía no existe</h1>
          <p className="mt-3 max-w-xl text-ink-500">
            Revisa el catálogo o solicita una nueva herramienta para futuras versiones de Modulaq.
          </p>
          <div className="mt-6">
            <Button href={routePaths.tools}>Volver al catálogo</Button>
          </div>
        </div>
      </Container>
    );
  }

  const ToolRenderer = getToolRenderer(tool.id);
  const hasDoc = Boolean(tool.doc);
  const hasIntegrableCode = Boolean(tool.integrableCode);

  return (
    <Container className="py-5 md:py-6 lg:py-8">
      <PageHead
        title={tool.seo?.title ?? tool.name}
        description={tool.seo?.description ?? tool.description}
        path={buildToolPath(tool.slug)}
      />
      <Link to={routePaths.tools} className="inline-flex items-center gap-2 text-sm font-semibold text-ink-700 hover:text-ink-900">
        <ArrowLeft size={16} />
        Volver al catálogo
      </Link>

      <section className="mt-2.5 rounded-lg border border-surface-200 bg-surface-50/82 p-3.5 shadow-panel">
        <div className="grid gap-2.5 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <h1 className="text-2xl font-semibold leading-tight text-ink-900 md:text-3xl">{tool.name}</h1>
            <p className="mt-1.5 max-w-4xl text-sm leading-6 text-ink-500 md:text-base md:leading-7">{tool.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <ToolStatusBadge status={tool.status} />
            <span className="rounded-md border border-surface-200 bg-surface-100/80 px-2.5 py-1 text-xs font-semibold text-ink-700">
              {getCategoryLabel(tool.category)}
            </span>
            <span className="rounded-md border border-surface-200 bg-surface-100/80 px-2.5 py-1 text-xs font-semibold text-ink-700">
              {pricingLabels[tool.pricing]}
            </span>
            <FavoriteToggleButton toolId={tool.id} toolName={tool.name} />
          </div>
        </div>
      </section>

      <section className="mt-3 rounded-lg border border-surface-200 bg-surface-50/82 shadow-panel">
        <div role="tablist" aria-label="Secciones de la herramienta" className="grid grid-cols-2 gap-2 border-b border-surface-200 p-2.5 lg:flex">
          {detailTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isAvailable =
              tool.modes.includes(tab.id) ||
              (tab.id === "documentation" && hasDoc) ||
              (tab.id === "integrable-code" && hasIntegrableCode);
            const isPlanned = tool.plannedModes.includes(tab.id) && !isAvailable;
            const isDisabled = !isAvailable && !isPlanned;
            const label = isPlanned ? getPlannedToolModeLabel(tab.id) : getToolModeLabel(tab.id);

            return (
              <button
                key={tab.id}
                id={`tool-tab-${tab.id}`}
                aria-controls={`tool-panel-${tab.id}`}
                aria-selected={isActive}
                className={cn(
                  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition",
                  isActive ? "bg-ink-900 text-surface-50 shadow-sm" : "text-ink-700 hover:bg-surface-100 hover:text-ink-900",
                  isDisabled && "cursor-not-allowed opacity-45",
                )}
                type="button"
                role="tab"
                disabled={isDisabled}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </div>

        <div className="p-3.5 md:p-4">
          <div
            id="tool-panel-online"
            role="tabpanel"
            aria-labelledby="tool-tab-online"
            hidden={activeTab !== "online"}
          >
            {ToolRenderer ? (
              <ClientOnly fallback={<ToolLoadingPanel />}>
                {() => (
                  <Suspense fallback={<ToolLoadingPanel />}>
                    <ToolRenderer tool={tool} />
                  </Suspense>
                )}
              </ClientOnly>
            ) : (
              <ComingSoonPanel title="Interfaz de herramienta pendiente" />
            )}
          </div>
          <div
            id="tool-panel-integrable-code"
            role="tabpanel"
            aria-labelledby="tool-tab-integrable-code"
            hidden={activeTab !== "integrable-code"}
          >
            {tool.integrableCode ? (
              <CodeSnippetPanel data={tool.integrableCode} />
            ) : (
              <ComingSoonPanel title="Código integrable: próximamente" />
            )}
          </div>
          <div id="tool-panel-api" role="tabpanel" aria-labelledby="tool-tab-api" hidden={activeTab !== "api"}>
            <ComingSoonPanel title="API: próximamente" />
          </div>
          <div
            id="tool-panel-documentation"
            role="tabpanel"
            aria-labelledby="tool-tab-documentation"
            hidden={activeTab !== "documentation"}
          >
            {tool.doc ? <ToolDocPanel doc={tool.doc} /> : <ComingSoonPanel title="Documentación: próximamente" />}
          </div>
        </div>
      </section>

      <details className="mt-6 rounded-lg border border-surface-200 bg-surface-50/82 shadow-sm">
        <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-ink-900 marker:text-accent-teal">
          Detalles técnicos
        </summary>
        <dl className="grid gap-3 border-t border-surface-200 px-5 py-4 text-sm md:grid-cols-2 lg:grid-cols-5">
          <div>
            <dt className="text-ink-500">ID</dt>
            <dd className="mt-1 font-semibold text-ink-900">{tool.id}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Slug</dt>
            <dd className="mt-1 font-semibold text-ink-900">{buildToolPath(tool.slug)}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Backend</dt>
            <dd className="mt-1 font-semibold text-ink-900">{tool.requiresBackend ? "Futuro" : "No requerido"}</dd>
          </div>
          <div>
            <dt className="text-ink-500">IA</dt>
            <dd className="mt-1 font-semibold text-ink-900">{tool.requiresAI ? "Futura" : "No requerida"}</dd>
          </div>
          <div>
            <dt className="text-ink-500">API</dt>
            <dd className="mt-1 font-semibold text-ink-900">{tool.apiStatus === "planned" ? "Planificada" : tool.apiStatus}</dd>
          </div>
        </dl>
      </details>
    </Container>
  );
}
