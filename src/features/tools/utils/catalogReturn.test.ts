import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __testing,
  consumeCatalogReturnState,
  markCameFromToolDetail,
  saveCatalogState,
  type CatalogPersistedState,
} from "./catalogReturn";

const { STATE_KEY, RETURN_FLAG_KEY } = __testing;

function installSessionStorage() {
  const store = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
  vi.stubGlobal("window", { sessionStorage: storage } as Window);
  return { store, storage };
}

const sampleState: CatalogPersistedState = {
  filters: {
    search: "pdf",
    categories: ["pdf", "image"],
    mode: "all",
    status: "all",
  },
  onlyFavorites: true,
  scrollY: 480,
  visibleCount: 24,
};

describe("catalogReturn", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = installSessionStorage().storage;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null and clears state when no return flag was set", () => {
    saveCatalogState(sampleState);
    expect(storage.getItem(STATE_KEY)).not.toBeNull();

    expect(consumeCatalogReturnState()).toBeNull();
    expect(storage.getItem(STATE_KEY)).toBeNull();
  });

  it("returns the saved state and clears flag + state when the flag was set", () => {
    saveCatalogState(sampleState);
    markCameFromToolDetail();
    expect(storage.getItem(RETURN_FLAG_KEY)).not.toBeNull();

    const restored = consumeCatalogReturnState();
    expect(restored).toEqual(sampleState);
    expect(storage.getItem(STATE_KEY)).toBeNull();
    expect(storage.getItem(RETURN_FLAG_KEY)).toBeNull();
  });

  it("returns null when flag is present but state is malformed", () => {
    storage.setItem(STATE_KEY, "{not json");
    markCameFromToolDetail();

    expect(consumeCatalogReturnState()).toBeNull();
    expect(storage.getItem(STATE_KEY)).toBeNull();
  });

  it("returns null when flag is present but no state was saved", () => {
    markCameFromToolDetail();

    expect(consumeCatalogReturnState()).toBeNull();
    expect(storage.getItem(RETURN_FLAG_KEY)).toBeNull();
  });

  it("rejects state with the wrong shape", () => {
    storage.setItem(STATE_KEY, JSON.stringify({ filters: { search: 1 }, onlyFavorites: true, scrollY: 0 }));
    markCameFromToolDetail();

    expect(consumeCatalogReturnState()).toBeNull();
  });

  it("preserves visibleCount on a valid restore", () => {
    saveCatalogState(sampleState);
    markCameFromToolDetail();

    const restored = consumeCatalogReturnState();
    expect(restored?.visibleCount).toBe(24);
  });

  it("rejects state with malformed visibleCount", () => {
    storage.setItem(
      STATE_KEY,
      JSON.stringify({ ...sampleState, visibleCount: "30" }),
    );
    markCameFromToolDetail();

    expect(consumeCatalogReturnState()).toBeNull();
  });

  it("rejects state with negative visibleCount", () => {
    storage.setItem(
      STATE_KEY,
      JSON.stringify({ ...sampleState, visibleCount: -5 }),
    );
    markCameFromToolDetail();

    expect(consumeCatalogReturnState()).toBeNull();
  });

  it("direct entry without flag clears stored visibleCount", () => {
    saveCatalogState(sampleState);
    expect(storage.getItem(STATE_KEY)).not.toBeNull();

    expect(consumeCatalogReturnState()).toBeNull();
    expect(storage.getItem(STATE_KEY)).toBeNull();
  });
});
