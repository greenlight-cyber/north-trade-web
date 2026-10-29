import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { localizePath, type RouteKey } from "@/i18n/routes";

/** Imagen para compartir del sitio: recorte 1200×630 de la foto aérea de la portada. */
export const defaultShareImage = {
  url: "/og-north-trade.jpg",
  width: 1200,
  height: 630,
  alt: {
    es: "Vista aérea de lotes agrícolas en Salta, separados por cortinas de monte nativo.",
    en: "Aerial view of farmland plots in Salta separated by strips of native woodland.",
  },
} as const;

const ogLocales: Record<Locale, string> = { es: "es_AR", en: "en_US" };

/** Etiquetas hreflang: el español es la versión por defecto (x-default). */
const hreflang: Record<Locale, string> = { es: "es-AR", en: "en" };

/** Dirección de una página en cada idioma, para `alternates` y el sitemap. */
export function languageAlternates(route: RouteKey, slug?: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) languages[hreflang[locale]] = localizePath(locale, route, slug);
  languages["x-default"] = localizePath(defaultLocale, route, slug);
  return languages;
}

type ShareImage = { url: string; width: number; height: number; alt: string };

type PageMetadataInput = {
  locale: Locale;
  route: RouteKey;
  slug?: string;
  /** Título de la página; la plantilla del layout le agrega " · North Trade". */
  title: string;
  /** El título ya es completo (portada): no se le agrega el nombre de la firma. */
  absoluteTitle?: boolean;
  description: string;
  image?: ShareImage;
  noIndex?: boolean;
};

/**
 * Metadatos completos de una página. Next reemplaza (no combina) el bloque `openGraph`
 * del layout cuando una página define el suyo, así que se arma entero acá.
 */
export function pageMetadata({
  locale,
  route,
  slug,
  title,
  absoluteTitle,
  description,
  image,
  noIndex,
}: PageMetadataInput): Metadata {
  const url = localizePath(locale, route, slug);
  const shareImage = image ?? {
    url: defaultShareImage.url,
    width: defaultShareImage.width,
    height: defaultShareImage.height,
    alt: defaultShareImage.alt[locale],
  };
  const shareTitle = absoluteTitle ? title : `${title} · ${siteConfig.name}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url, languages: languageAlternates(route, slug) },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: ogLocales[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocales[l]),
      url,
      title: shareTitle,
      description,
      images: [shareImage],
    },
    twitter: { card: "summary_large_image" },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
