import type { MetadataRoute } from "next";

import { locales } from "@/i18n/config";
import { localizePath, type RouteKey } from "@/i18n/routes";
import { languageAlternates } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import { getListedSlugs } from "@/sanity/properties";

const sections: RouteKey[] = ["home", "properties", "about", "contact"];

/** Todas las páginas públicas en ambos idiomas; las fichas vendidas no se incluyen. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const absolute = (path: string) => new URL(path, site).toString();
  const slugs = await getListedSlugs().catch(() => []);

  const pages: { route: RouteKey; slug?: string }[] = [
    ...sections.map((route) => ({ route })),
    ...slugs.map((slug) => ({ route: "properties" as const, slug })),
  ];

  return pages.flatMap(({ route, slug }) => {
    const languages = Object.fromEntries(
      Object.entries(languageAlternates(route, slug)).map(([tag, path]) => [tag, absolute(path)]),
    );
    return locales.map((locale) => ({
      url: absolute(localizePath(locale, route, slug)),
      alternates: { languages },
    }));
  });
}
