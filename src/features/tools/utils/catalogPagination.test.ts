import { describe, expect, it } from "vitest";
import {
  INITIAL_VISIBLE_TOOLS,
  LOAD_MORE_SIZE,
  clampVisibleCount,
  paginateCatalogItems,
} from "./catalogPagination";

function buildItems(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index + 1);
}

describe("paginateCatalogItems", () => {
  it("total menor que initial: muestra todo y hasMore=false", () => {
    const items = buildItems(5);
    const result = paginateCatalogItems({ items, visibleCount: INITIAL_VISIBLE_TOOLS });

    expect(result.visibleItems).toEqual(items);
    expect(result.totalItems).toBe(5);
    expect(result.visibleCount).toBe(5);
    expect(result.hasMore).toBe(false);
    expect(result.remainingCount).toBe(0);
  });

  it("total mayor que initial: muestra initial y hasMore=true", () => {
    const items = buildItems(30);
    const result = paginateCatalogItems({ items, visibleCount: INITIAL_VISIBLE_TOOLS });

    expect(result.visibleItems).toHaveLength(INITIAL_VISIBLE_TOOLS);
    expect(result.totalItems).toBe(30);
    expect(result.hasMore).toBe(true);
    expect(result.remainingCount).toBe(30 - INITIAL_VISIBLE_TOOLS);
    expect(result.nextVisibleCount).toBe(INITIAL_VISIBLE_TOOLS + LOAD_MORE_SIZE);
  });

  it("nextVisibleCount no supera el total filtrado", () => {
    const items = buildItems(20);
    const result = paginateCatalogItems({ items, visibleCount: INITIAL_VISIBLE_TOOLS });

    expect(result.hasMore).toBe(true);
    expect(result.nextVisibleCount).toBe(20);
  });

  it("load more suma LOAD_MORE_SIZE incrementando el visibleCount", () => {
    const items = buildItems(50);
    const first = paginateCatalogItems({ items, visibleCount: INITIAL_VISIBLE_TOOLS });
    const next = paginateCatalogItems({ items, visibleCount: first.nextVisibleCount });

    expect(next.visibleCount).toBe(INITIAL_VISIBLE_TOOLS + LOAD_MORE_SIZE);
    expect(next.visibleItems).toHaveLength(INITIAL_VISIBLE_TOOLS + LOAD_MORE_SIZE);
    expect(next.hasMore).toBe(true);
  });

  it("respeta el conjunto filtrado más chico que el total global", () => {
    const items = buildItems(8);
    const result = paginateCatalogItems({ items, visibleCount: INITIAL_VISIBLE_TOOLS });

    expect(result.totalItems).toBe(8);
    expect(result.visibleItems).toHaveLength(8);
    expect(result.hasMore).toBe(false);
    expect(result.nextVisibleCount).toBe(8);
  });

  it("respeta visibleCount restaurado si es válido y menor al total", () => {
    const items = buildItems(40);
    const result = paginateCatalogItems({ items, visibleCount: 30 });

    expect(result.visibleCount).toBe(30);
    expect(result.visibleItems).toHaveLength(30);
    expect(result.hasMore).toBe(true);
    expect(result.remainingCount).toBe(10);
  });

  it("normaliza visibleCount inválido: NaN cae a INITIAL_VISIBLE_TOOLS", () => {
    const items = buildItems(30);
    const result = paginateCatalogItems({ items, visibleCount: Number.NaN });

    expect(result.visibleCount).toBe(INITIAL_VISIBLE_TOOLS);
  });

  it("normaliza visibleCount inválido: negativo cae a INITIAL_VISIBLE_TOOLS", () => {
    const items = buildItems(30);
    const result = paginateCatalogItems({ items, visibleCount: -5 });

    expect(result.visibleCount).toBe(INITIAL_VISIBLE_TOOLS);
  });

  it("recorta visibleCount cuando supera el total filtrado", () => {
    const items = buildItems(7);
    const result = paginateCatalogItems({ items, visibleCount: 50 });

    expect(result.visibleCount).toBe(7);
    expect(result.hasMore).toBe(false);
  });

  it("total cero: todo en cero y sin hasMore", () => {
    const result = paginateCatalogItems({ items: [], visibleCount: INITIAL_VISIBLE_TOOLS });

    expect(result.visibleItems).toEqual([]);
    expect(result.totalItems).toBe(0);
    expect(result.visibleCount).toBe(0);
    expect(result.hasMore).toBe(false);
    expect(result.remainingCount).toBe(0);
    expect(result.nextVisibleCount).toBe(0);
  });

  it("pageSize custom se aplica al calcular nextVisibleCount", () => {
    const items = buildItems(40);
    const result = paginateCatalogItems({ items, visibleCount: 10, pageSize: 5 });

    expect(result.nextVisibleCount).toBe(15);
  });
});

describe("clampVisibleCount", () => {
  it("normaliza NaN a INITIAL_VISIBLE_TOOLS si hay items suficientes", () => {
    expect(clampVisibleCount(Number.NaN, 30)).toBe(INITIAL_VISIBLE_TOOLS);
  });

  it("recorta al total disponible", () => {
    expect(clampVisibleCount(50, 8)).toBe(8);
  });

  it("preserva valores válidos enteros dentro del rango", () => {
    expect(clampVisibleCount(30, 100)).toBe(30);
  });

  it("trunca decimales a enteros", () => {
    expect(clampVisibleCount(30.7, 100)).toBe(30);
  });
});
