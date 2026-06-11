// Paginación simulada del catálogo: helper puro reutilizable.
//
// Diseño:
// - Sin React: la lógica vive en una función testeable que recibe el set ya
//   filtrado y el visibleCount actual, y devuelve los items a renderizar más
//   metadatos para la UI (botón "Cargar más", contador, etc.).
// - Pensada como plantilla para una paginación real: el día que cambie el
//   backend o se introduzcan páginas numeradas, el contrato visible/total/
//   hasMore se mantiene y los call-sites no tienen que reescribirse.
// - Los valores por defecto son los del producto V3.0.1a; ajustar acá no
//   requiere tocar componentes.

export const INITIAL_VISIBLE_TOOLS = 18;
export const LOAD_MORE_SIZE = 12;

export type PaginateCatalogInput<T> = {
  items: readonly T[];
  visibleCount: number;
  pageSize?: number;
};

export type PaginatedCatalogResult<T> = {
  visibleItems: T[];
  totalItems: number;
  visibleCount: number;
  hasMore: boolean;
  remainingCount: number;
  nextVisibleCount: number;
};

/**
 * Devuelve la porción visible del catálogo y todos los metadatos que la UI
 * necesita para renderizar el botón "Cargar más" y los contadores.
 *
 * Normaliza visibleCount inválido (NaN, negativo) al mínimo razonable. Si el
 * total es 0, hasMore=false y todos los contadores quedan en cero. Si
 * visibleCount supera el total filtrado, lo recorta al total.
 */
export function paginateCatalogItems<T>({
  items,
  visibleCount,
  pageSize = LOAD_MORE_SIZE,
}: PaginateCatalogInput<T>): PaginatedCatalogResult<T> {
  const totalItems = items.length;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : LOAD_MORE_SIZE;
  const safeVisible = clampVisibleCount(visibleCount, totalItems);
  const visibleItems = items.slice(0, safeVisible);
  const hasMore = safeVisible < totalItems;
  const remainingCount = Math.max(0, totalItems - safeVisible);
  const nextVisibleCount = Math.min(totalItems, safeVisible + safePageSize);

  return {
    visibleItems,
    totalItems,
    visibleCount: safeVisible,
    hasMore,
    remainingCount,
    nextVisibleCount,
  };
}

/**
 * Normaliza el `visibleCount` persistido en sessionStorage o pasado por la UI:
 * descarta NaN/Infinity/negativos, cae a INITIAL_VISIBLE_TOOLS cuando es cero o
 * inválido y nunca devuelve un valor mayor al total disponible.
 */
export function clampVisibleCount(visibleCount: number, totalItems: number): number {
  if (!Number.isFinite(visibleCount) || visibleCount <= 0) {
    return Math.min(INITIAL_VISIBLE_TOOLS, Math.max(0, totalItems));
  }
  const integer = Math.floor(visibleCount);
  return Math.min(integer, Math.max(0, totalItems));
}
