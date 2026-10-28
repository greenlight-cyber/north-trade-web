import { describe, expect, it } from "vitest";

import {
  filterProperties,
  parseListingFilters,
  pickHighlights,
  sortProperties,
  type PropertySummary,
} from "./listing";

const cover = {
  ref: "image-a-10x10-jpg",
  alt: null,
  lqip: null,
  hotspot: null,
};

const make = (id: string, overrides: Partial<PropertySummary> = {}): PropertySummary => ({
  id,
  slug: id,
  title: { es: id },
  status: "disponible",
  category: "rural",
  propertyType: "agricola",
  province: "salta",
  zone: { es: "Anta" },
  areaHectares: 500,
  featured: false,
  createdAt: "2026-01-01T00:00:00Z",
  cover: null,
  ...overrides,
});

describe("parseListingFilters", () => {
  it("acepta solo valores conocidos", () => {
    expect(
      parseListingFilters({ provincia: "salta", tipo: "inventado", superficie: "100-1000" }),
    ).toEqual({
      provincia: "salta",
      superficie: "100-1000",
    });
  });

  it("toma el primer valor si viene repetido", () => {
    expect(parseListingFilters({ provincia: ["jujuy", "salta"] })).toEqual({ provincia: "jujuy" });
  });
});

describe("filterProperties", () => {
  const list = [
    make("chico", { areaHectares: 50 }),
    make("medio", { areaHectares: 100, province: "jujuy" }),
    make("sin-dato", { areaHectares: null }),
    make("grande", { areaHectares: 5000, propertyType: "ganadero" }),
    make("vendida", { status: "vendida" }),
    make("reservada", { status: "reservada" }),
  ];
  const ids = (l: PropertySummary[]) => l.map((p) => p.id);

  it("oculta las vendidas aunque no haya filtros", () => {
    expect(ids(filterProperties(list, {}))).not.toContain("vendida");
    expect(ids(filterProperties(list, {}))).toContain("reservada");
  });

  it("filtra por rango con mínimo incluido y máximo excluido", () => {
    expect(ids(filterProperties(list, { superficie: "0-100" }))).toEqual(["chico"]);
    expect(ids(filterProperties(list, { superficie: "100-1000" }))).toEqual(["medio", "reservada"]);
    expect(ids(filterProperties(list, { superficie: "5000+" }))).toEqual(["grande"]);
  });

  it("combina provincia y tipo", () => {
    expect(ids(filterProperties(list, { provincia: "jujuy" }))).toEqual(["medio"]);
    expect(ids(filterProperties(list, { tipo: "ganadero" }))).toEqual(["grande"]);
  });
});

describe("sortProperties y pickHighlights", () => {
  const list = [
    make("vieja-con-foto", { cover, createdAt: "2025-01-01T00:00:00Z" }),
    make("nueva-sin-foto", { createdAt: "2026-06-01T00:00:00Z" }),
    make("nueva-con-foto", { cover, createdAt: "2026-05-01T00:00:00Z" }),
  ];

  it("ordena las que tienen foto primero y después por fecha", () => {
    expect(sortProperties(list).map((p) => p.id)).toEqual([
      "nueva-con-foto",
      "vieja-con-foto",
      "nueva-sin-foto",
    ]);
  });

  it("muestra destacadas si las hay; si no, las recientes con foto", () => {
    expect(pickHighlights(list, 5).map((p) => p.id)).toEqual(["nueva-con-foto", "vieja-con-foto"]);
    const withFeatured = [...list, make("destacada", { featured: true })];
    expect(pickHighlights(withFeatured, 5).map((p) => p.id)).toEqual(["destacada"]);
  });
});
