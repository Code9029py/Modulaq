// Persistencia contextual del catálogo cuando el usuario navega:
//   /herramientas -> /herramientas/foo -> back -> /herramientas
//
// Diseño:
// - El detalle de herramienta marca una "señal" en sessionStorage al montar.
// - El catálogo consume esa señal en su primer mount: si está, restaura el
//   estado previo (filtros + scroll); si no, arranca en default y limpia
//   cualquier estado huérfano para no contaminar futuras sesiones.
// - Persistencia en sessionStorage (no localStorage) para evitar que el
//   estado quede pegado entre sesiones.
//
// SSR-safe: todas las helpers chequean `typeof window`.
import type { ToolCategoryId, ToolFilters, ToolModeId, ToolStatus } from "../types/tool.types";

const STATE_KEY = "modulaq:catalog:state:v1";
const RETURN_FLAG_KEY = "modulaq:catalog:returnFromTool:v1";

export const CATALOG_INITIAL_VISIBLE_COUNT = 18;
export const CATALOG_LOAD_MORE_COUNT = 18;

export type CatalogPersistedState = {
  filters: ToolFilters;
  onlyFavorites: boolean;
  visibleCount: number;
  scrollY: number;
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function isToolFilters(value: unknown): value is ToolFilters {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ToolFilters>;
  return (
    typeof candidate.search === "string" &&
    Array.isArray(candidate.categories) &&
    candidate.categories.every((id) => typeof id === "string") &&
    typeof candidate.mode === "string" &&
    typeof candidate.status === "string"
  );
}

function isPersistedState(value: unknown): value is CatalogPersistedState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CatalogPersistedState>;
  return (
    isToolFilters(candidate.filters) &&
    typeof candidate.onlyFavorites === "boolean" &&
    typeof candidate.visibleCount === "number" &&
    Number.isInteger(candidate.visibleCount) &&
    candidate.visibleCount >= CATALOG_INITIAL_VISIBLE_COUNT &&
    typeof candidate.scrollY === "number" &&
    Number.isFinite(candidate.scrollY) &&
    typeof candidate.visibleCount === "number" &&
    Number.isFinite(candidate.visibleCount) &&
    candidate.visibleCount >= 0
  );
}

/** Marca que el usuario está dentro de un detalle de herramienta. */
export function markCameFromToolDetail(): void {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(RETURN_FLAG_KEY, "1");
  } catch {
    // sessionStorage puede fallar (modo privado, cuotas); silencioso.
  }
}

/** Guarda el estado actual del catálogo. Llamar en cada cambio relevante. */
export function saveCatalogState(state: CatalogPersistedState): void {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // Silencioso.
  }
}

/**
 * Si el usuario vuelve desde un detalle de herramienta, devuelve el estado
 * guardado y limpia la señal. En cualquier otro caso, devuelve null y
 * descarta el estado para que la siguiente entrada arranque en default.
 */
export function consumeCatalogReturnState(): CatalogPersistedState | null {
  if (!isBrowser()) return null;
  const storage = window.sessionStorage;
  try {
    const flag = storage.getItem(RETURN_FLAG_KEY);
    storage.removeItem(RETURN_FLAG_KEY);
    if (!flag) {
      storage.removeItem(STATE_KEY);
      return null;
    }
    const raw = storage.getItem(STATE_KEY);
    storage.removeItem(STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return isPersistedState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Utilidades exportadas sólo para tests. */
export const __testing = {
  STATE_KEY,
  RETURN_FLAG_KEY,
  isPersistedState,
};

// Re-export para uso inferido en componentes (mantiene la API tipada acotada).
export type { ToolCategoryId, ToolModeId, ToolStatus };
