import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PageHero } from "@/components/page-hero";
import { PropertyCard } from "@/components/property-card";
import { PropertySearch } from "@/components/property-search";
import { WhatsAppSeal } from "@/components/whatsapp-seal";
import {
  filterProperties,
  hasFilters,
  parseListingFilters,
  sortProperties,
} from "@/domain/listing";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/get-dictionary";
import { localizePath } from "@/i18n/routes";
import { pageMetadata } from "@/lib/seo";
import { getListedProperties } from "@/sanity/properties";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/propiedades">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  // Las vistas filtradas apuntan a la canónica sin filtros.
  return pageMetadata({
    locale: lang,
    route: "properties",
    title: dict.listing.title,
    description: dict.listing.lead,
  });
}

export default async function ListingPage({
  params,
  searchParams,
}: PageProps<"/[lang]/propiedades">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      <PageHero backdrop="cultivo" title={dict.listing.title} lead={dict.listing.lead} />
      <div className="mx-auto max-w-360 px-5 pb-20 sm:px-8 lg:px-16 lg:pb-28">
        {/* Los filtros dependen de la dirección: esa parte se arma al pedir la página. */}
        <Suspense fallback={<p className="mt-14 text-line">{dict.listing.loading}</p>}>
          <Results lang={lang} dict={dict} searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

type ResultsProps = {
  lang: Locale;
  dict: Dictionary;
  searchParams: PageProps<"/[lang]/propiedades">["searchParams"];
};

async function Results({ lang, dict, searchParams }: ResultsProps) {
  const filters = parseListingFilters(await searchParams);
  const properties = sortProperties(filterProperties(await getListedProperties(), filters));
  const filtered = hasFilters(filters);

  return (
    <>
      {/* La clave renueva los valores elegidos al navegar entre búsquedas. */}
      <PropertySearch
        key={JSON.stringify(filters)}
        locale={lang}
        dict={dict}
        values={filters}
        className="mt-12 lg:mt-16"
      />

      <section aria-labelledby="resultados" className="mt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-ink pb-4">
          <h2 id="resultados" className="font-serif text-xl" aria-live="polite">
            {dict.listing.count(properties.length)}
          </h2>
          {filtered && (
            <Link
              href={localizePath(lang, "properties")}
              className="link-trace pb-0.5 text-sm text-line transition-colors hover:text-ink"
            >
              {dict.listing.clearFilters}
            </Link>
          )}
        </div>

        {properties.length ? (
          <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {properties.map((property, index) => (
              <li key={property.id} className={index < 3 ? undefined : "reveal"}>
                <PropertyCard property={property} locale={lang} dict={dict} priority={index < 2} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-14 max-w-xl">
            <p className="font-serif text-3xl">{dict.listing.emptyTitle}</p>
            <p className="mt-3 text-ink/85">{dict.listing.emptyText}</p>
            <WhatsAppSeal locale={lang} label={dict.contact.whatsappCta} className="mt-6" />
          </div>
        )}
      </section>
    </>
  );
}
