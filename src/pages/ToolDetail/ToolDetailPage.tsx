import { ArrowLeft, ArrowRight, Braces, FileText, Globe2, Server } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ClientOnly } from "vite-react-ssg";
import { CodeSnippetPanel } from "../../features/tools/components/CodeSnippetPanel";
import { FavoriteToggleButton } from "../../features/tools/components/FavoriteToggleButton";
import { ToolDocPanel } from "../../features/tools/components/ToolDocPanel";
import { useRecentTools } from "../../features/tools/context/ToolPrefsProvider";
import { ToolStatusBadge } from "../../features/tools/components/ToolStatusBadge";
import { getToolRenderer } from "../../features/tools/renderers/toolRenderers";
import type { ToolDefinition, ToolModeId } from "../../features/tools/types/tool.types";
import { markCameFromToolDetail } from "../../features/tools/utils/catalogReturn";
import { getToolById } from "../../features/tools/utils/getToolById";
import { getToolBySlug } from "../../features/tools/utils/getToolBySlug";
import { localizeTool, useTool } from "../../features/tools/utils/localizeTool";
import { Button } from "../../shared/components/Button";
import { Container } from "../../shared/components/Container";
import { HeroBadge } from "../../shared/components/HeroBadge";
import { HeroPanel } from "../../shared/components/HeroPanel";
import { PageBackdrop } from "../../shared/components/PageBackdrop";
import { Tag } from "../../shared/components/Tag";
import type { TranslationKey } from "../../shared/i18n/dictionaries/es";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { buildToolPathFor, localizedPath } from "../../shared/i18n/paths";
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

const tabLabelKeys: Record<ToolModeId, TranslationKey> = {
  online: "toolDetail.tabs.online",
  documentation: "toolDetail.tabs.documentation",
  "integrable-code": "toolDetail.tabs.integrableCode",
  api: "toolDetail.tabs.api",
};

const tabPlannedLabelKeys: Record<ToolModeId, TranslationKey> = {
  online: "toolDetail.tabs.onlinePlanned",
  documentation: "toolDetail.tabs.documentationPlanned",
  "integrable-code": "toolDetail.tabs.integrableCodePlanned",
  api: "toolDetail.tabs.apiPlanned",
};

const relatedToolIds: Record<string, string[]> = {
  "merge-pdf": ["split-pdf", "reorder-pdf-pages"],
  "split-pdf": ["merge-pdf", "reorder-pdf-pages"],
  "reorder-pdf-pages": ["merge-pdf", "split-pdf"],
  "image-to-pdf": ["merge-pdf"],
  "image-to-base64": ["base64-to-image"],
  "base64-to-image": ["image-to-base64"],
};

function isDefinition(tool: ToolDefinition | undefined): tool is ToolDefinition {
  return Boolean(tool);
}

function ComingSoonPanel({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border border-dashed border-surface-200/80 bg-surface-50/90 p-6 text-center shadow-sm ring-1 ring-surface-50/80 backdrop-blur">
      <p className="text-sm font-semibold text-ink-900">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">
        {description ?? t("toolDetail.comingSoon.default")}
      </p>
    </div>
  );
}

function ToolLoadingPanel() {
  const { t } = useI18n();
  return (
    <div
      aria-live="polite"
      className="rounded-2xl border border-surface-200/80 bg-surface-50/90 p-6 text-center text-sm font-semibold text-ink-700 shadow-sm ring-1 ring-surface-50/80 backdrop-blur"
      role="status"
    >
      {t("toolDetail.loading")}
    </div>
  );
}

export function ToolDetailPage() {
  const { slug } = useParams();
  const definition = getToolBySlug(slug);
  const localizedTool = useTool(definition);
  const [activeTab, setActiveTab] = useState<ToolModeId>("online");
  const { recordVisit, hydrated } = useRecentTools();
  const { language, t } = useI18n();
  const toolsPath = localizedPath("tools", language);

  useEffect(() => {
    if (definition && hydrated) {
      recordVisit(definition.id);
    }
  }, [definition, hydrated, recordVisit]);

  useEffect(() => {
    // Señala al catálogo que la próxima entrada viene desde un detalle de
    // herramienta para que restaure filtros + scroll. Marca sólo si hubo
    // resolución válida; rutas inexistentes no deberían disparar la señal.
    if (definition) {
      markCameFromToolDetail();
    }
  }, [definition]);

  if (!definition || !localizedTool) {
    return (
      <section className="relative overflow-hidden">
        <PageBackdrop tone="cyan-violet" />
        <Container className="relative py-16">
          <PageHead
            noindex
            title={t("toolDetail.notFoundBadge")}
            description={t("toolDetail.notFoundHeadDescription")}
            path={toolsPath}
          />
          <HeroPanel className="p-8 md:p-8">
            <HeroBadge icon={FileText}>{t("toolDetail.notFoundBadge")}</HeroBadge>
            <h1 className="mt-3 text-3xl font-semibold text-ink-900">{t("toolDetail.notFoundH1")}</h1>
            <p className="mt-3 max-w-xl text-ink-500">{t("toolDetail.notFoundBody")}</p>
            <div className="mt-6">
              <Button href={toolsPath}>{t("toolDetail.back")}</Button>
            </div>
          </HeroPanel>
        </Container>
      </section>
    );
  }

  const tool = localizedTool;
  const ToolRenderer = getToolRenderer(tool.id);
  const hasDoc = Boolean(tool.doc);
  const hasIntegrableCode = Boolean(tool.integrableCode);
  const relatedTools = (relatedToolIds[tool.id] ?? [])
    .map((relatedId) => getToolById(relatedId))
    .filter(isDefinition)
    .map((def) => localizeTool(def, language));
  const selfPath = buildToolPathFor(tool, language);

  return (
    <section className="relative overflow-hidden">
      <PageBackdrop tone="cyan-violet" />
      <Container className="relative py-5 md:py-6 lg:py-8">
        <PageHead
          title={tool.seo?.title ?? tool.name}
          description={tool.seo?.description ?? tool.description}
          path={selfPath}
          noindex={language === "en" && tool.i18nIncomplete === true}
        />
        <Link to={toolsPath} className="inline-flex items-center gap-2 text-sm font-semibold text-ink-700 hover:text-ink-900">
          <ArrowLeft size={16} />
          {t("toolDetail.back")}
        </Link>

        <HeroPanel className="mt-2.5 p-4 md:p-5">
          <div className="grid gap-2.5 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <h1 className="text-2xl font-semibold leading-tight text-ink-900 md:text-3xl">{tool.name}</h1>
              <p className="mt-1.5 max-w-4xl text-sm leading-6 text-ink-500 md:text-base md:leading-7">{tool.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <ToolStatusBadge status={tool.status} />
              <Tag>{t(`category.${tool.category}` as TranslationKey)}</Tag>
              <Tag>{t(`toolDetail.pricing.${tool.pricing}` as TranslationKey)}</Tag>
              <FavoriteToggleButton toolId={tool.id} toolName={tool.name} />
            </div>
          </div>
        </HeroPanel>

        <section className="mt-3 overflow-hidden rounded-2xl border border-surface-200/80 bg-surface-50/90 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
          <div role="tablist" aria-label={t("toolDetail.tabs.aria")} className="grid grid-cols-2 gap-2 border-b border-surface-200/80 bg-surface-50/65 p-2.5 lg:flex">
            {detailTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isAvailable =
                tool.modes.includes(tab.id) ||
                (tab.id === "documentation" && hasDoc) ||
                (tab.id === "integrable-code" && hasIntegrableCode);
              const isPlanned = tool.plannedModes.includes(tab.id) && !isAvailable;
              const isDisabled = !isAvailable && !isPlanned;
              const label = isPlanned ? t(tabPlannedLabelKeys[tab.id]) : t(tabLabelKeys[tab.id]);

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
                <ComingSoonPanel title={t("toolDetail.toolMissing")} />
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
                <ComingSoonPanel title={t("toolDetail.comingSoon.codeTitle")} />
              )}
            </div>
            <div id="tool-panel-api" role="tabpanel" aria-labelledby="tool-tab-api" hidden={activeTab !== "api"}>
              <ComingSoonPanel
                title={t("toolDetail.comingSoon.apiTitle")}
                description={t("toolDetail.comingSoon.apiDescription")}
              />
            </div>
            <div
              id="tool-panel-documentation"
              role="tabpanel"
              aria-labelledby="tool-tab-documentation"
              hidden={activeTab !== "documentation"}
            >
              {tool.doc ? <ToolDocPanel doc={tool.doc} /> : <ComingSoonPanel title={t("toolDetail.comingSoon.docTitle")} />}
            </div>
          </div>
        </section>

        {relatedTools.length > 0 ? (
          <section className="mt-3 rounded-2xl border border-surface-200/80 bg-surface-50/90 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
            <p className="text-sm font-semibold text-ink-900">{t("toolDetail.related")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {relatedTools.map((relatedTool) => (
                <Link
                  key={relatedTool.id}
                  to={buildToolPathFor(relatedTool, language)}
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
            {t("toolDetail.tech.title")}
          </summary>
          <dl className="grid gap-3 border-t border-surface-200/80 px-5 py-4 text-sm md:grid-cols-2 lg:grid-cols-5">
            <div>
              <dt className="text-ink-500">{t("toolDetail.tech.id")}</dt>
              <dd className="mt-1 font-semibold text-ink-900">{tool.id}</dd>
            </div>
            <div>
              <dt className="text-ink-500">{t("toolDetail.tech.slug")}</dt>
              <dd className="mt-1 font-semibold text-ink-900">{selfPath}</dd>
            </div>
            <div>
              <dt className="text-ink-500">{t("toolDetail.tech.backend")}</dt>
              <dd className="mt-1 font-semibold text-ink-900">
                {tool.requiresBackend ? t("toolDetail.tech.backendFuture") : t("toolDetail.tech.backendNone")}
              </dd>
            </div>
            <div>
              <dt className="text-ink-500">{t("toolDetail.tech.ai")}</dt>
              <dd className="mt-1 font-semibold text-ink-900">
                {tool.requiresAI ? t("toolDetail.tech.aiFuture") : t("toolDetail.tech.aiNone")}
              </dd>
            </div>
            <div>
              <dt className="text-ink-500">{t("toolDetail.tech.api")}</dt>
              <dd className="mt-1 font-semibold text-ink-900">
                {tool.apiStatus === "planned" ? t("toolDetail.tech.apiPlanned") : tool.apiStatus}
              </dd>
            </div>
          </dl>
        </details>
      </Container>
    </section>
  );
}
