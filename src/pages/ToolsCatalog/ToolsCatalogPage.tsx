import { ArrowLeft, ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { categories } from "../../config/categories";
import { toolModes } from "../../config/toolModes";
import { ToolCard } from "../../features/tools/components/ToolCard";
import { ToolFilters } from "../../features/tools/components/ToolFilters";
import { tools } from "../../features/tools/data/tools";
import type { ToolFilters as ToolFiltersType } from "../../features/tools/types/tool.types";
import { filterTools, getAvailableModeIds, getVisibleCategoryIds, getVisibleStatuses } from "../../features/tools/utils/filterTools";
import { Button } from "../../shared/components/Button";
import { Container } from "../../shared/components/Container";
import { EmptyState } from "../../shared/components/EmptyState";
import { SectionHeader } from "../../shared/components/SectionHeader";
import { PageHead } from "../../shared/seo/PageHead";
import { cn } from "../../shared/utils/cn";

const defaultFilters: ToolFiltersType = {
  search: "",
  category: "all",
  mode: "all",
  status: "all",
};

export function ToolsCatalogPage() {
  const [filters, setFilters] = useState<ToolFiltersType>(defaultFilters);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  const visibleCategories = useMemo(() => {
    const visibleCategoryIds = getVisibleCategoryIds(tools);
    return categories.filter((category) => visibleCategoryIds.includes(category.id));
  }, []);

  const visibleModes = useMemo(() => {
    const availableModeIds = getAvailableModeIds(tools);
    return toolModes.filter((mode) => availableModeIds.includes(mode.id));
  }, []);

  const visibleStatuses = useMemo(() => getVisibleStatuses(tools), []);
  const filteredTools = useMemo(() => filterTools(tools, filters), [filters]);
  const hasActiveFilters =
    filters.search !== "" || filters.category !== "all" || filters.mode !== "all" || filters.status !== "all";

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <Container className="py-8 md:py-9 lg:py-10">
      <PageHead
        title="Herramientas online gratis"
        description="Catálogo de microherramientas de Modulaq: PDF, texto y productividad. Todas funcionan online, gratis y directo en tu navegador."
        path="/herramientas"
      />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          eyebrow="Catálogo"
          headingLevel="h1"
          title="Herramientas modulares"
          description="Explora las primeras herramientas de Modulaq. Buscá rápido y ajustá filtros solo cuando haga falta."
        />
        <div className="flex items-center gap-3 lg:hidden">
          <Button
            aria-controls="compact-tool-filters"
            aria-expanded={isMobileFiltersOpen}
            type="button"
            variant="secondary"
            className="gap-2"
            onClick={() => setIsMobileFiltersOpen((value) => !value)}
          >
            <SlidersHorizontal size={16} />
            Filtros
          </Button>
          <span className="text-sm font-medium text-ink-500">{filteredTools.length} herramientas</span>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-surface-200 bg-surface-50/84 p-3 shadow-panel">
        <label className="grid gap-2 text-sm font-semibold text-ink-700">
          Buscar herramienta
          <span className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" size={18} />
            <input
              className="min-h-12 w-full rounded-md border border-surface-200 bg-surface-100/70 py-2 pl-10 pr-3 text-base font-normal text-ink-900 outline-none transition placeholder:text-ink-500/70 focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/15"
              placeholder="Buscar por nombre, descripción o etiqueta..."
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value })}
            />
          </span>
        </label>
      </div>

      {isMobileFiltersOpen ? (
        <section id="compact-tool-filters" className="mt-4 rounded-lg border border-surface-200 bg-surface-50/84 p-4 shadow-panel lg:hidden">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink-900">Filtrar catálogo</h2>
            {hasActiveFilters ? (
              <button className="text-sm font-semibold text-ink-700 hover:text-ink-900" type="button" onClick={resetFilters}>
                Limpiar
              </button>
            ) : null}
          </div>
          <ToolFilters
            categories={visibleCategories}
            filters={filters}
            modes={visibleModes}
            onChange={setFilters}
            statuses={visibleStatuses}
          />
        </section>
      ) : null}

      <div
        className={cn(
          "mt-6 grid gap-6",
          isDesktopSidebarOpen ? "lg:grid-cols-[218px_1fr]" : "lg:grid-cols-1",
        )}
      >
        {isDesktopSidebarOpen ? (
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-lg border border-surface-200 bg-surface-50/84 shadow-panel">
              <button
                className="flex min-h-12 w-full items-center justify-center border-b border-surface-200 px-3 text-sm font-semibold text-ink-700 transition hover:bg-surface-100"
                type="button"
                onClick={() => setIsDesktopSidebarOpen(false)}
              >
                Reducir filtros
                <ArrowLeft className="ml-2" size={16} />
              </button>
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-ink-900">Filtros</h2>
                  {hasActiveFilters ? (
                    <button className="text-xs font-semibold text-ink-700 hover:text-ink-900" type="button" onClick={resetFilters}>
                      Limpiar
                    </button>
                  ) : null}
                </div>
                <ToolFilters
                  categories={visibleCategories}
                  filters={filters}
                  modes={visibleModes}
                  onChange={setFilters}
                  statuses={visibleStatuses}
                />
              </div>
            </div>
          </aside>
        ) : null}

        <section>
          <div className="mb-4 hidden items-center justify-between gap-3 lg:flex">
            <div className="flex items-center gap-3">
              {!isDesktopSidebarOpen ? (
                <Button type="button" variant="secondary" onClick={() => setIsDesktopSidebarOpen(true)}>
                  Expandir filtros
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              ) : null}
              <p className="text-sm font-medium text-ink-500">
                {filteredTools.length} de {tools.length} herramientas
              </p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">V1 modular</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>

          {filteredTools.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title="No hay herramientas para esos filtros"
                description="Prueba con otra búsqueda o categoría. El catálogo crecerá de forma progresiva."
              />
            </div>
          ) : null}
        </section>
      </div>
    </Container>
  );
}
