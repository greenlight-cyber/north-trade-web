import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

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
    <div className="mx-auto max-w-360 px-5 pt-10 pb-20 sm:px-8 lg:px-16 lg:pt-14">
      <header className="max-w-3xl">
        <h1 className="text-display">{dict.listing.title}</h1>
        <p className="mt-4 text-ink/85">{dict.listing.lead}</p>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14">
        {/* Los filtros dependen de la dirección: esa parte se arma al pedir la página. */}
        <Suspense fallback={<p className="text-line lg:col-span-2">{dict.listing.loading}</p>}>
          <Results lang={lang} dict={dict} searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
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
      <aside className="lg:sticky lg:top-6 lg:self-start">
        {/* La clave renueva los valores elegidos al navegar entre búsquedas. */}
        <PropertySearch key={JSON.stringify(filters)} locale={lang} dict={dict} values={filters} />
        {filtered && (
          <Link
            href={localizePath(lang, "properties")}
            className="mt-3 inline-block text-sm text-line underline underline-offset-4 hover:text-ink"
          >
            {dict.listing.clearFilters}
          </Link>
        )}
      </aside>

      <section aria-labelledby="resultados">
        <h2
          id="resultados"
          className="border-b border-line pb-3 text-sm text-line"
          aria-live="polite"
        >
          {dict.listing.count(properties.length)}
        </h2>

        {properties.length ? (
          <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {properties.map((property, index) => (
              <li key={property.id}>
                <PropertyCard property={property} locale={lang} dict={dict} priority={index < 2} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 max-w-xl">
            <p className="font-serif text-2xl">{dict.listing.emptyTitle}</p>
            <p className="mt-3 text-ink/85">{dict.listing.emptyText}</p>
            <WhatsAppSeal locale={lang} label={dict.contact.whatsappCta} className="mt-6" />
          </div>
        )}
      </section>
    </>
  );
}
