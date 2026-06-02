import { ArrowLeft, ArrowRight, Braces, FileText, Globe2, Server } from "lucide-react";
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
import type { ToolMetadata, ToolModeId } from "../../features/tools/types/tool.types";
import { getToolBySlug } from "../../features/tools/utils/getToolBySlug";
import { Button } from "../../shared/components/Button";
import { Container } from "../../shared/components/Container";
import { HeroBadge } from "../../shared/components/HeroBadge";
import { HeroPanel } from "../../shared/components/HeroPanel";
import { PageBackdrop } from "../../shared/components/PageBackdrop";
import { Tag } from "../../shared/components/Tag";
import { PageHead } from "../../shared/seo/PageHead";
import { cn } from "../../shared/utils/cn";

type DetailTab = {
  id: ToolModeId;
  icon: typeof Globe2;
};

const detailTabs: DetailTab[] = [
  { id: "online", icon: Globe2 },
  { id: "documentation", icon: FileText },
  { id: "integrable-code", icon: Braces },
  { id: "api", icon: Server },
];

const fileProcessingNotice =
  "El procesamiento de este archivo ocurre en tu navegador; no lo subimos a Modulaq.";

const toolIntroNotices: Record<string, string> = {
  "merge-pdf": fileProcessingNotice,
  "split-pdf": fileProcessingNotice,
  "image-to-pdf": fileProcessingNotice,
  "pdf-to-images": fileProcessingNotice,
  "compress-pdf":
    "Esta herramienta intenta optimizar la estructura del PDF en tu navegador. No recomprime imágenes ni garantiza reducción. El resultado depende del contenido del archivo.",
  "extract-pdf-text": fileProcessingNotice,
  "pdf-page-counter": fileProcessingNotice,
  "reorder-pdf-pages": fileProcessingNotice,
};

const relatedToolSlugs: Record<string, string[]> = {
  "merge-pdf": ["dividir-pdf", "reordenar-paginas-pdf"],
  "split-pdf": ["unir-pdfs", "reordenar-paginas-pdf"],
  "reorder-pdf-pages": ["unir-pdfs", "dividir-pdf"],
  "image-to-pdf": ["unir-pdfs"],
};

function isToolMetadata(tool: ToolMetadata | undefined): tool is ToolMetadata {
  return Boolean(tool);
}

function ComingSoonPanel({
  title,
  description = "Próximamente: este apartado quedará disponible cuando la herramienta avance de fase.",
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-surface-200/80 bg-surface-50/90 p-6 text-center shadow-sm ring-1 ring-surface-50/80 backdrop-blur">
      <p className="text-sm font-semibold text-ink-900">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">{description}</p>
    </div>
  );
}

function ToolLoadingPanel() {
  return (
    <div
      aria-live="polite"
      className="rounded-2xl border border-surface-200/80 bg-surface-50/90 p-6 text-center text-sm font-semibold text-ink-700 shadow-sm ring-1 ring-surface-50/80 backdrop-blur"
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
      <section className="relative overflow-hidden">
        <PageBackdrop tone="cyan-violet" />
        <Container className="relative py-16">
          <PageHead
            noindex
            title="Herramienta no encontrada"
            description="La herramienta solicitada no existe en Modulaq. Revisá el catálogo de microherramientas disponibles."
            path="/herramientas"
          />
          <HeroPanel className="p-8 md:p-8">
            <HeroBadge icon={FileText}>Herramienta no encontrada</HeroBadge>
            <h1 className="mt-3 text-3xl font-semibold text-ink-900">Esa herramienta todavía no existe</h1>
            <p className="mt-3 max-w-xl text-ink-500">
              Revisa el catálogo o solicita una nueva herramienta para futuras versiones de Modulaq.
            </p>
            <div className="mt-6">
              <Button href={routePaths.tools}>Volver al catálogo</Button>
            </div>
          </HeroPanel>
        </Container>
      </section>
    );
  }

  const ToolRenderer = getToolRenderer(tool.id);
  const hasDoc = Boolean(tool.doc);
  const hasIntegrableCode = Boolean(tool.integrableCode);
  const introNotice = toolIntroNotices[tool.id];
  const relatedTools = (relatedToolSlugs[tool.id] ?? []).map((relatedSlug) => getToolBySlug(relatedSlug)).filter(isToolMetadata);

  return (
    <section className="relative overflow-hidden">
      <PageBackdrop tone="cyan-violet" />
      <Container className="relative py-5 md:py-6 lg:py-8">
        <PageHead
          title={tool.seo?.title ?? tool.name}
          description={tool.seo?.description ?? tool.description}
          path={buildToolPath(tool.slug)}
        />
        <Link to={routePaths.tools} className="inline-flex items-center gap-2 text-sm font-semibold text-ink-700 hover:text-ink-900">
          <ArrowLeft size={16} />
          Volver al catálogo
        </Link>

      <HeroPanel className="mt-2.5 p-4 md:p-5">
        <div className="grid gap-2.5 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <h1 className="text-2xl font-semibold leading-tight text-ink-900 md:text-3xl">{tool.name}</h1>
            <p className="mt-1.5 max-w-4xl text-sm leading-6 text-ink-500 md:text-base md:leading-7">{tool.description}</p>
            {introNotice ? (
              <p className="mt-2 max-w-4xl rounded-lg border border-accent-cyan/20 bg-accent-cyan/10 px-3 py-2 text-sm leading-6 text-ink-700">
                {introNotice}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <ToolStatusBadge status={tool.status} />
            <Tag>{getCategoryLabel(tool.category)}</Tag>
            <Tag>{pricingLabels[tool.pricing]}</Tag>
            <FavoriteToggleButton toolId={tool.id} toolName={tool.name} />
          </div>
        </div>
      </HeroPanel>

      <section className="mt-3 overflow-hidden rounded-2xl border border-surface-200/80 bg-surface-50/90 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <div role="tablist" aria-label="Secciones de la herramienta" className="grid grid-cols-2 gap-2 border-b border-surface-200/80 bg-surface-50/65 p-2.5 lg:flex">
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
                  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-accent-cyan/25",
                  isActive
                    ? "border-ink-900 bg-ink-900 text-surface-50"
                    : "border-transparent bg-transparent text-ink-700 hover:border-surface-200/80 hover:bg-surface-50 hover:text-ink-900",
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
            <ComingSoonPanel
              title="API: próximamente"
              description="Un endpoint para usar esta herramienta desde tu backend; todavía no está disponible. Mientras tanto, el Código integrable corre en tu navegador, sin servidor."
            />
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

      {relatedTools.length > 0 ? (
        <section className="mt-3 rounded-2xl border border-surface-200/80 bg-surface-50/90 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
          <p className="text-sm font-semibold text-ink-900">Herramientas relacionadas</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {relatedTools.map((relatedTool) => (
              <Link
                key={relatedTool.id}
                to={buildToolPath(relatedTool.slug)}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-surface-200/80 bg-surface-50/90 px-3 py-2 text-sm font-semibold text-ink-700 shadow-sm transition hover:border-accent-cyan/35 hover:bg-surface-50 hover:text-ink-900"
              >
                {relatedTool.name}
                <ArrowRight size={15} />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <details className="mt-6 rounded-2xl border border-surface-200/80 bg-surface-50/90 shadow-sm ring-1 ring-surface-50/80 backdrop-blur">
        <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-ink-900 marker:text-accent-teal">
          Detalles técnicos
        </summary>
        <dl className="grid gap-3 border-t border-surface-200/80 px-5 py-4 text-sm md:grid-cols-2 lg:grid-cols-5">
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
    </section>
  );
}
