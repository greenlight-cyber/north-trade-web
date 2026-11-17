import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.hoisted(() => vi.fn());
vi.mock("next/cache", () => ({ cacheTag: vi.fn(), cacheLife: vi.fn() }));
vi.mock("@sanity/client", () => ({ createClient: () => ({ fetch: fetchMock }) }));

import { getListedProperties, getListedSlugs, getProperty } from "./properties";

const summary = (slug: string) => ({
  id: `id-${slug}`,
  slug,
  title: { es: "Campo", en: null },
  status: "disponible",
  category: "rural",
  propertyType: "agricola",
  province: "salta",
  zone: { es: "Anta", en: null },
  areaHectares: 500,
  featured: false,
  createdAt: "2026-10-01T00:00:00Z",
  cover: null,
});

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "proyecto");
  vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", "production");
  vi.spyOn(console, "warn").mockImplementation(() => {});
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("lectura de propiedades desde Sanity", () => {
  it("omite las fichas con una dirección web mal formada", async () => {
    fetchMock.mockResolvedValue([
      summary("campo-en-anta"),
      summary("lote-3.5"),
      summary("con/barra"),
      summary("Mayusculas"),
    ]);
    const list = await getListedProperties();
    expect(list.map((p) => p.slug)).toEqual(["campo-en-anta"]);
    expect(console.warn).toHaveBeenCalledTimes(3);
  });

  it("solo devuelve direcciones válidas para el sitemap y las páginas", async () => {
    fetchMock.mockResolvedValue(["campo-en-anta", "lote-3.5", null, 42, "finca-1"]);
    expect(await getListedSlugs()).toEqual(["campo-en-anta", "finca-1"]);
  });

  it("no consulta a Sanity por una dirección imposible", async () => {
    expect(await getProperty("../admin")).toBeNull();
    expect(await getProperty("lote-3.5")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("consulta una dirección válida como parámetro, no dentro de la consulta", async () => {
    fetchMock.mockResolvedValue(null);
    expect(await getProperty("campo-en-anta")).toBeNull();
    const [query, params] = fetchMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(params).toEqual({ slug: "campo-en-anta" });
    expect(query).not.toContain("campo-en-anta");
  });

  it("nunca pide las notas del equipo ni la dirección vieja", async () => {
    fetchMock.mockResolvedValue([]);
    await getListedProperties();
    await getListedSlugs();
    fetchMock.mockResolvedValue(null);
    await getProperty("campo-en-anta");
    for (const [query] of fetchMock.mock.calls as [string][]) {
      expect(query).not.toMatch(/internalNotes|legacyPath/);
    }
  });

  it("sin configuración de Sanity devuelve vacío sin fallar", async () => {
    vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "");
    expect(await getListedProperties()).toEqual([]);
    expect(await getProperty("campo-en-anta")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
