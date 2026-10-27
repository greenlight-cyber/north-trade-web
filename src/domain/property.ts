import type { Locale } from "@/i18n/config";

export const propertyStatuses = [
  { value: "disponible", label: { es: "Disponible", en: "Available" }, plural: "Disponibles" },
  { value: "reservada", label: { es: "Reservada", en: "Reserved" }, plural: "Reservadas" },
  { value: "vendida", label: { es: "Vendida", en: "Sold" }, plural: "Vendidas" },
] as const;

export type PropertyStatus = (typeof propertyStatuses)[number]["value"];

/** El español es obligatorio al publicar, pero un borrador puede no tenerlo. */
export type LocalizedString = { es?: string | null; en?: string | null };

/** Texto en el idioma pedido; si falta la traducción, cae al español. */
export function pickLocale(value: LocalizedString | null | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale]?.trim() || value.es?.trim() || "";
}

const formatters: Record<Locale, Intl.NumberFormat> = {
  es: new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }),
  en: new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }),
};

/**
 * Superficie para mostrar: en hectáreas, o en m² si es menor a una hectárea
 * (terrenos urbanos). Devuelve null si no hay dato.
 */
export function formatArea(
  hectares: number | null | undefined,
  locale: Locale,
): { value: string; unit: "ha" | "m²" } | null {
  if (hectares == null || !Number.isFinite(hectares) || hectares <= 0) return null;
  const squareMeters = Math.round(hectares * 10_000);
  if (squareMeters <= 0) return null;
  if (squareMeters < 10_000) {
    return { value: formatters[locale].format(squareMeters), unit: "m²" };
  }
  return { value: formatters[locale].format(hectares), unit: "ha" };
}
