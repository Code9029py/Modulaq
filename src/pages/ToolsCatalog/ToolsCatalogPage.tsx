import { ArrowLeft, ArrowRight, LayoutGrid, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { categories } from "../../config/categories";
import { toolModes } from "../../config/toolModes";
import { ToolCard } from "../../features/tools/components/ToolCard";
import { ToolFilters } from "../../features/tools/components/ToolFilters";
import { useFavorites } from "../../features/tools/context/ToolPrefsProvider";
import { tools } from "../../features/tools/data/tools";
import type { ToolFilters as ToolFiltersType } from "../../features/tools/types/tool.types";
import {
  filterTools,
  getAvailableModeIds,
  getVisibleCategoryIds,
  getVisibleStatuses,
  orderToolsByFavoriteIds,
} from "../../features/tools/utils/filterTools";
import { Button } from "../../shared/components/Button";
import { Container } from "../../shared/components/Container";
import { EmptyState } from "../../shared/components/EmptyState";
import { HeroBadge } from "../../shared/components/HeroBadge";
import { HeroPanel } from "../../shared/components/HeroPanel";
import { PageBackdrop } from "../../shared/components/PageBackdrop";
import { PageHead } from "../../shared/seo/PageHead";
import { inputClassName } from "../../shared/styles/inputClassName";
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
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const { hydrated, favoriteIds } = useFavorites();

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
  const showFavoritesFilter = hydrated;
  const displayedTools = useMemo(() => {
    if (!showFavoritesFilter) {
      return filteredTools;
    }

    const favoriteIdSet = new Set(favoriteIds);
    const scopedTools = onlyFavorites ? filteredTools.filter((tool) => favoriteIdSet.has(tool.id)) : filteredTools;

    return orderToolsByFavoriteIds(scopedTools, favoriteIds);
  }, [favoriteIds, filteredTools, onlyFavorites, showFavoritesFilter]);
  const hasActiveFilters =
    onlyFavorites ||
    filters.search !== "" ||
    filters.category !== "all" ||
    filters.mode !== "all" ||
    filters.status !== "all";

  const resetFilters = () => {
    setFilters(defaultFilters);
    setOnlyFavorites(false);
  };

  return (
    <section className="relative overflow-hidden">
      <PageBackdrop tone="cyan-mint" />
      <Container className="relative py-10 md:py-12">
        <PageHead
          title="Herramientas PDF, QR y texto gratis"
          description="Explora herramientas gratuitas de Modulaq para PDF, QR y texto. Usa utilidades rápidas en tu navegador, sin cuenta y sin instalar nada."
          path="/herramientas"
        />
        <HeroPanel>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <HeroBadge icon={LayoutGrid}>Catálogo</HeroBadge>
              <h1 className="text-3xl font-semibold leading-tight text-ink-900 md:text-4xl">
                Herramientas PDF, QR y texto gratis
              </h1>
              <p className="mt-3 max-w-5xl text-base leading-7 text-ink-500">
                Explorá el catálogo de Modulaq y abrí la que necesites. Todo corre en tu navegador.
              </p>
            </div>
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
              <span className="text-sm font-medium text-ink-500">{displayedTools.length} herramientas</span>
            </div>
          </div>
        </HeroPanel>

        <div className="mt-5 rounded-2xl border border-surface-200/75 bg-gradient-to-br from-surface-50/95 to-surface-100/50 p-4 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
        <label className="grid gap-2 text-sm font-semibold text-ink-700">
          Buscar herramienta
          <span className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" size={18} />
            <input
              className={cn(inputClassName, "min-h-12 w-full py-2 pl-10 pr-3 text-base")}
              placeholder="Buscar por nombre, descripción o etiqueta..."
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value })}
            />
          </span>
        </label>
        </div>

        {isMobileFiltersOpen ? (
        <section id="compact-tool-filters" className="mt-4 rounded-xl border border-surface-200/80 bg-surface-50/90 p-4 shadow-panel ring-1 ring-surface-50/80 lg:hidden">
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
            favoriteCount={favoriteIds.length}
            filters={filters}
            modes={visibleModes}
            onChange={setFilters}
            onOnlyFavoritesChange={setOnlyFavorites}
            onlyFavorites={onlyFavorites}
            showFavoritesFilter={showFavoritesFilter}
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
            <div className="sticky top-24 overflow-hidden rounded-xl border border-surface-200/80 bg-surface-50/90 shadow-panel ring-1 ring-surface-50/80 backdrop-blur">
              <button
                className="flex min-h-12 w-full items-center justify-center border-b border-surface-200/80 bg-surface-50/70 px-3 text-sm font-semibold text-ink-700 transition hover:bg-surface-100/80"
                type="button"
                onClick={() => setIsDesktopSidebarOpen(false)}
              >
                Reducir filtros
                <ArrowLeft className="ml-2" size={16} />
              </button>
              <div className="p-4">
                {hasActiveFilters ? (
                  <div className="mb-4 flex justify-end">
                    <button className="text-xs font-semibold text-ink-700 hover:text-ink-900" type="button" onClick={resetFilters}>
                      Limpiar filtros
                    </button>
                  </div>
                ) : null}
                <ToolFilters
                  categories={visibleCategories}
                  favoriteCount={favoriteIds.length}
                  filters={filters}
                  modes={visibleModes}
                  onChange={setFilters}
                  onOnlyFavoritesChange={setOnlyFavorites}
                  onlyFavorites={onlyFavorites}
                  showFavoritesFilter={showFavoritesFilter}
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
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsDesktopSidebarOpen(true)}
                >
                  Expandir filtros
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              ) : null}
              <p className="text-sm font-medium text-ink-500">
                {displayedTools.length} de {tools.length} herramientas
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {displayedTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>

          {displayedTools.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title={onlyFavorites ? "No hay favoritos con esos filtros" : "No hay herramientas para esos filtros"}
                description={
                  onlyFavorites
                    ? "Quitá el filtro de favoritos o marcá herramientas con la estrella para verlas acá."
                    : "Prueba con otra búsqueda o categoría. El catálogo crecerá de forma progresiva."
                }
              />
            </div>
          ) : null}
        </section>
        </div>
      </Container>
    </section>
  );
}
