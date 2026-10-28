import { areaRanges, propertyTypes, provinces } from "@/config/catalog";

import type { PropertyStatus } from "./property";

/** Datos de una propiedad que necesitan el listado y las tarjetas. */
export type PropertyImage = {
  ref: string;
  alt: { es?: string | null; en?: string | null } | null;
  lqip: string | null;
  hotspot: { x: number; y: number } | null;
};

export type PropertySummary = {
  id: string;
  slug: string;
  title: { es?: string | null; en?: string | null };
  status: PropertyStatus;
  category: "rural" | "urbana";
  propertyType: string;
  province: string;
  zone: { es?: string | null; en?: string | null } | null;
  areaHectares: number | null;
  featured: boolean;
  createdAt: string;
  cover: PropertyImage | null;
};

/** Las vendidas no se listan: el sitio es para compradores. */
export const listedStatuses: readonly PropertyStatus[] = ["disponible", "reservada"];

export type ListingFilters = { provincia?: string; tipo?: string; superficie?: string };

type SearchParams = Record<string, string | string[] | undefined>;

const known = (items: { value: string }[], value: string | string[] | undefined) => {
  const v = Array.isArray(value) ? value[0] : value;
  return v && items.some((i) => i.value === v) ? v : undefined;
};

/** Lee los filtros de la dirección; ignora valores desconocidos en lugar de fallar. */
export function parseListingFilters(params: SearchParams): ListingFilters {
  const filters: ListingFilters = {};
  const provincia = known(provinces, params.provincia);
  const tipo = known(propertyTypes, params.tipo);
  const superficie = known(areaRanges, params.superficie);
  if (provincia) filters.provincia = provincia;
  if (tipo) filters.tipo = tipo;
  if (superficie) filters.superficie = superficie;
  return filters;
}

export function hasFilters(filters: ListingFilters): boolean {
  return Boolean(filters.provincia || filters.tipo || filters.superficie);
}

export function filterProperties<T extends PropertySummary>(
  list: T[],
  filters: ListingFilters,
): T[] {
  const range = areaRanges.find((r) => r.value === filters.superficie);
  return list.filter((p) => {
    if (!listedStatuses.includes(p.status)) return false;
    if (filters.provincia && p.province !== filters.provincia) return false;
    if (filters.tipo && p.propertyType !== filters.tipo) return false;
    if (range) {
      if (p.areaHectares === null) return false;
      if (p.areaHectares < range.min) return false;
      if (range.max !== null && p.areaHectares >= range.max) return false;
    }
    return true;
  });
}

/** Destacadas primero, después las que tienen foto, y dentro de cada grupo las más nuevas. */
export function sortProperties<T extends PropertySummary>(list: T[]): T[] {
  return [...list].sort(
    (a, b) =>
      Number(b.featured) - Number(a.featured) ||
      Number(Boolean(b.cover)) - Number(Boolean(a.cover)) ||
      b.createdAt.localeCompare(a.createdAt),
  );
}

/** Para la portada: las destacadas o, si no hay, las más recientes con foto. */
export function pickHighlights<T extends PropertySummary>(list: T[], count: number): T[] {
  const listed = sortProperties(filterProperties(list, {}));
  const featured = listed.filter((p) => p.featured);
  return (featured.length ? featured : listed.filter((p) => p.cover)).slice(0, count);
}
