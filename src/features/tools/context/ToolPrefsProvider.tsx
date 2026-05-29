import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { readJson, writeJson } from "../../../shared/storage/localStore";
import { tools } from "../data/tools";

const FAVORITES_KEY = "modulaq:favorites:v1";
const RECENT_KEY = "modulaq:recent:v1";
const RECENT_LIMIT = 8;

type RecentEntry = { id: string; at: number };

type ToolPrefsContextValue = {
  hydrated: boolean;
  favoriteIds: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  recentIds: string[];
  recordVisit: (id: string) => void;
  clearRecent: () => void;
};

const ToolPrefsContext = createContext<ToolPrefsContextValue | null>(null);

const validIds = new Set(tools.map((tool) => tool.id));

function sanitizeFavorites(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((id): id is string => typeof id === "string" && validIds.has(id));
}

function sanitizeRecent(value: unknown): RecentEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((entry): entry is RecentEntry => {
      if (!entry || typeof entry !== "object") {
        return false;
      }
      const candidate = entry as Partial<RecentEntry>;
      return typeof candidate.id === "string" && validIds.has(candidate.id) && typeof candidate.at === "number";
    })
    .slice(0, RECENT_LIMIT);
}

export function ToolPrefsProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recent, setRecent] = useState<RecentEntry[]>([]);

  useEffect(() => {
    setFavoriteIds(sanitizeFavorites(readJson(FAVORITES_KEY, [])));
    setRecent(sanitizeRecent(readJson(RECENT_KEY, [])));
    setHydrated(true);

    function handleStorage(event: StorageEvent) {
      if (event.key === FAVORITES_KEY) {
        setFavoriteIds(sanitizeFavorites(readJson(FAVORITES_KEY, [])));
      }
      if (event.key === RECENT_KEY) {
        setRecent(sanitizeRecent(readJson(RECENT_KEY, [])));
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Persistencia derivada del estado (no side-effects dentro de los updaters).
  // El guard `hydrated` evita pisar lo almacenado con el estado vacío inicial.
  useEffect(() => {
    if (hydrated) {
      writeJson(FAVORITES_KEY, favoriteIds);
    }
  }, [favoriteIds, hydrated]);

  useEffect(() => {
    if (hydrated) {
      writeJson(RECENT_KEY, recent);
    }
  }, [recent, hydrated]);

  const toggleFavorite = useCallback((id: string) => {
    if (!validIds.has(id)) {
      return;
    }
    setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]));
  }, []);

  const recordVisit = useCallback((id: string) => {
    if (!validIds.has(id)) {
      return;
    }
    setRecent((prev) => [{ id, at: Date.now() }, ...prev.filter((entry) => entry.id !== id)].slice(0, RECENT_LIMIT));
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
  }, []);

  const recentIds = useMemo(() => recent.map((entry) => entry.id), [recent]);
  const isFavorite = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds]);

  const value = useMemo<ToolPrefsContextValue>(
    () => ({ hydrated, favoriteIds, isFavorite, toggleFavorite, recentIds, recordVisit, clearRecent }),
    [hydrated, favoriteIds, isFavorite, toggleFavorite, recentIds, recordVisit, clearRecent],
  );

  return <ToolPrefsContext.Provider value={value}>{children}</ToolPrefsContext.Provider>;
}

function useToolPrefs() {
  const context = useContext(ToolPrefsContext);
  if (!context) {
    throw new Error("useToolPrefs debe usarse dentro de ToolPrefsProvider");
  }
  return context;
}

export function useFavorites() {
  const { hydrated, favoriteIds, isFavorite, toggleFavorite } = useToolPrefs();
  return { hydrated, favoriteIds, isFavorite, toggleFavorite };
}

export function useRecentTools() {
  const { hydrated, recentIds, recordVisit, clearRecent } = useToolPrefs();
  return { hydrated, recentIds, recordVisit, clearRecent };
}
