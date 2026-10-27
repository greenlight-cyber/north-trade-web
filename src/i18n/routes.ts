import { defaultLocale, isLocale, type Locale } from "./config";

/**
 * Las carpetas de `app/[lang]` usan los nombres en español. Cada idioma
 * publica sus propios nombres de sección y el proxy los traduce.
 */
export const routes = {
  home: { es: "", en: "" },
  properties: { es: "propiedades", en: "properties" },
  about: { es: "nosotros", en: "about" },
  contact: { es: "contacto", en: "contact" },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof routes;

const internalSegments: readonly string[] = Object.values(routes).map((r) => r.es);

/** Dirección pública de una sección (y opcionalmente de una ficha) en un idioma. */
export function localizePath(locale: Locale, route: RouteKey, slug?: string): string {
  const parts: string[] = [];
  if (locale !== defaultLocale) parts.push(locale);
  const segment = routes[route][locale];
  if (segment) parts.push(segment);
  if (slug) parts.push(encodeURIComponent(slug));
  return `/${parts.join("/")}`;
}

function splitPath(pathname: string): string[] {
  return pathname.split("/").filter(Boolean);
}

/** Traduce el primer segmento público de un idioma a otro (o al interno). */
function translateSegment(segment: string, from: Locale, to: Locale): string | null {
  for (const r of Object.values(routes)) {
    if (r[from] && r[from] === segment) return r[to];
  }
  return null;
}

export type ProxyDecision =
  | { action: "next" }
  | { action: "rewrite"; pathname: string }
  | { action: "redirect"; pathname: string };

/**
 * Decide qué hacer con una dirección pública:
 * - "/propiedades" se sirve internamente desde "/es/propiedades".
 * - "/en/properties" se sirve desde "/en/propiedades".
 * - "/es/..." o "/en/propiedades" redirigen a su forma pública canónica.
 */
export function resolveLocaleRoute(pathname: string): ProxyDecision {
  const [first, second, ...rest] = splitPath(pathname);

  if (first === defaultLocale) {
    return { action: "redirect", pathname: `/${[second, ...rest].filter(Boolean).join("/")}` };
  }

  if (first && isLocale(first)) {
    if (!second) return { action: "rewrite", pathname: `/${first}` };
    const internal = translateSegment(second, first, defaultLocale);
    if (internal !== null) {
      return { action: "rewrite", pathname: `/${[first, internal, ...rest].join("/")}` };
    }
    // Nombre interno en español usado bajo otro idioma: se envía al nombre público.
    if (internalSegments.includes(second)) {
      const publicSegment = translateSegment(second, defaultLocale, first);
      if (publicSegment) {
        return { action: "redirect", pathname: `/${[first, publicSegment, ...rest].join("/")}` };
      }
    }
    return { action: "next" };
  }

  return {
    action: "rewrite",
    pathname: `/${[defaultLocale, first, second, ...rest].filter(Boolean).join("/")}`,
  };
}

/** Separa idioma y resto de una dirección, pública ("/en/properties") o interna ("/es/propiedades"). */
function parseLocalePath(pathname: string): { locale: Locale; rest: string[] } {
  const parts = splitPath(pathname);
  const [first] = parts;
  if (first && isLocale(first)) return { locale: first, rest: parts.slice(1) };
  return { locale: defaultLocale, rest: parts };
}

/**
 * Forma pública canónica de una dirección. `usePathname()` devuelve la ruta
 * reescrita por el proxy ("/es/propiedades", "/en/propiedades"), no la del navegador.
 */
export function toPublicPath(pathname: string): string {
  const { locale, rest } = parseLocalePath(pathname);
  const [segment, ...tail] = rest;
  const publicSegment =
    segment && locale !== defaultLocale
      ? (translateSegment(segment, defaultLocale, locale) ?? segment)
      : segment;
  const out = [locale === defaultLocale ? null : locale, publicSegment || null, ...tail].filter(
    (p): p is string => Boolean(p),
  );
  return `/${out.join("/")}`;
}

/** Misma página en otro idioma, a partir de la dirección actual (pública o interna). */
export function switchLocalePath(pathname: string, target: Locale): string {
  const { locale: current, rest } = parseLocalePath(toPublicPath(pathname));
  const [segment, ...tail] = rest;

  const translated = segment ? (translateSegment(segment, current, target) ?? segment) : "";
  const out = [target === defaultLocale ? null : target, translated || null, ...tail].filter(
    (p): p is string => Boolean(p),
  );
  return `/${out.join("/")}`;
}
