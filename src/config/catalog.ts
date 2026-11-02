import type { Locale } from "@/i18n/config";

type Option = { value: string; label: Record<Locale, string> };

/** Provincias donde North Trade tiene o tuvo propiedades publicadas. */
export const provinces: Option[] = [
  { value: "salta", label: { es: "Salta", en: "Salta" } },
  { value: "formosa", label: { es: "Formosa", en: "Formosa" } },
  { value: "jujuy", label: { es: "Jujuy", en: "Jujuy" } },
  { value: "chaco", label: { es: "Chaco", en: "Chaco" } },
];

/** Tipos de propiedad, tomados de las publicaciones del sitio anterior. */
export const propertyTypes: Option[] = [
  { value: "agricola", label: { es: "Agrícola", en: "Cropland" } },
  { value: "ganadero", label: { es: "Ganadero", en: "Cattle ranch" } },
  { value: "agricola-ganadero", label: { es: "Agrícola-ganadero", en: "Mixed farming" } },
  { value: "vinedos", label: { es: "Viñedos", en: "Vineyards" } },
  { value: "monte", label: { es: "A desarrollar", en: "Undeveloped land" } },
  { value: "fraccion", label: { es: "Terreno rural", en: "Rural plot" } },
  { value: "urbana", label: { es: "Propiedades urbanas", en: "Urban properties" } },
];

/** Nombre visible de un valor guardado; si no está en la lista, el valor tal cual. */
export function optionLabel(items: Option[], value: string, locale: Locale): string {
  return items.find((i) => i.value === value)?.label[locale] ?? value;
}

/** Rangos de superficie en hectáreas (mínimo incluido, máximo excluido). */
export const areaRanges: (Option & { min: number; max: number | null })[] = [
  { value: "0-100", min: 0, max: 100, label: { es: "Hasta 100 ha", en: "Up to 100 ha" } },
  { value: "100-1000", min: 100, max: 1000, label: { es: "100 a 1.000 ha", en: "100–1,000 ha" } },
  {
    value: "1000-5000",
    min: 1000,
    max: 5000,
    label: { es: "1.000 a 5.000 ha", en: "1,000–5,000 ha" },
  },
  { value: "5000+", min: 5000, max: null, label: { es: "Más de 5.000 ha", en: "Over 5,000 ha" } },
];
