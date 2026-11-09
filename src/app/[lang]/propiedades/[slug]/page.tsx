import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { ArrowRightIcon, PhoneIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { PlatPlaceholder } from "@/components/plat-placeholder";
import { PropertyPhoto } from "@/components/property-photo";
import { WhatsAppSeal } from "@/components/whatsapp-seal";
import { optionLabel, propertyTypes, provinces } from "@/config/catalog";
import { siteConfig } from "@/config/site";
import type { PropertyImage } from "@/domain/listing";
import { formatArea, pickLocale, propertyStatuses } from "@/domain/property";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/get-dictionary";
import { localizePath } from "@/i18n/routes";
import { pageMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import { realEstateListingData } from "@/lib/structured-data";
import { shareImageUrl } from "@/sanity/image-url";
import { getListedSlugs, getProperty, type PropertyDetail } from "@/sanity/properties";

// Cache Components exige al menos una dirección al compilar; esta responde «no encontrada».
const placeholderSlug = "sin-propiedades";

export async function generateStaticParams() {
  const slugs = await getListedSlugs();
  return (slugs.length ? slugs : [placeholderSlug]).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/propiedades/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const property = await getProperty(slug);
  if (!property) return {};
  const title = pickLocale(property.title, lang);
  const cover = property.gallery[0];
  const image = cover && shareImageUrl(cover.ref);
  return pageMetadata({
    locale: lang,
    route: "properties",
    slug: property.slug,
    title,
    description: metaDescription(property, lang),
    image: image ? { url: image, width: 1200, height: 630, alt: title } : undefined,
    // Las vendidas siguen visibles para enlaces viejos, pero no se ofrecen en buscadores.
    noIndex: property.status === "vendida",
  });
}

/** Texto en una sola línea, sin espacios ni saltos repetidos. */
const singleLine = (text: string) => text.replace(/\s+/g, " ").trim();

/** "450 ha · Anta · Salta. " más el comienzo de la descripción, hasta ~160 caracteres. */
function metaDescription(property: PropertyDetail, lang: Locale): string {
  const area = formatArea(property.areaHectares, lang);
  const facts = [
    area && `${area.value} ${area.unit}`,
    pickLocale(property.zone, lang),
    optionLabel(provinces, property.province, lang),
  ]
    .filter(Boolean)
    .join(" · ");
  const text = singleLine(pickLocale(property.description, lang));
  const full = text ? `${facts}. ${text}` : facts;
  return full.length <= 160 ? full : `${full.slice(0, 157).replace(/\s+\S*$/, "")}…`;
}

export default function PropertyPage({ params }: PageProps<"/[lang]/propiedades/[slug]">) {
  return (
    <div className="mx-auto max-w-360 px-5 pt-8 pb-20 sm:px-8 lg:px-16 lg:pt-12 lg:pb-28">
      <Suspense fallback={<p className="py-20 text-line">…</p>}>
        <PropertyDetails params={params} />
      </Suspense>
    </div>
  );
}

async function PropertyDetails({
  params,
}: Pick<PageProps<"/[lang]/propiedades/[slug]">, "params">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const property = await getProperty(slug);
  if (!property) notFound();

  const dict = getDictionary(lang);
  const title = pickLocale(property.title, lang);
  const zone = pickLocale(property.zone, lang);
  const province = optionLabel(provinces, property.province, lang);
  const area = formatArea(property.areaHectares, lang);
  const areaText = area ? `${area.value} ${area.unit}` : null;
  const status = propertyStatuses.find((s) => s.value === property.status);
  const sold = property.status === "vendida";
  const description = pickLocale(property.description, lang);
  const untranslated = lang !== "es" && !property.description?.en?.trim() && Boolean(description);
  const [cover, ...photos] = property.gallery;

  // Las vendidas no se ofrecen a los buscadores.
  const listingData = sold
    ? null
    : realEstateListingData({
        siteUrl: getSiteUrl(),
        path: localizePath(lang, "properties", property.slug),
        name: title,
        description: singleLine(description).slice(0, 500),
        image: cover ? (shareImageUrl(cover.ref) ?? undefined) : undefined,
        zone,
        province,
      });

  const place = [zone, province].filter(Boolean).join(" · ");

  return (
    <article>
      {listingData && <JsonLd data={listingData} />}
      <Link
        href={localizePath(lang, "properties")}
        className="group link-trace inline-flex items-center gap-2 pb-0.5 text-sm text-line transition-colors hover:text-ink"
      >
        <ArrowRightIcon className="rotate-180 transition-transform duration-300 group-hover:-translate-x-1" />
        {dict.property.back}
      </Link>

      <header className="mt-10 grid grid-cols-1 items-end gap-6 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-8">
          <div className="rise flex flex-wrap items-center gap-4">
            {place && <p className="eyebrow">{place}</p>}
            {status && property.status !== "disponible" && (
              <p className="bg-seal px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.16em] text-paper uppercase">
                {status.label[lang]}
              </p>
            )}
          </div>
          <h1 className="rise mt-5 text-display text-balance [--i:1]">{title}</h1>
        </div>
        {areaText && (
          <p className="rise font-serif text-4xl tabular-nums [--i:2] lg:col-span-4 lg:pb-1 lg:text-right lg:text-5xl">
            {areaText}
          </p>
        )}
      </header>

      <section aria-label={dict.property.photos} className="mt-10 lg:mt-12">
        <div className="rise relative aspect-4/3 overflow-hidden bg-paper-deep [--i:3] sm:aspect-video lg:aspect-[21/10]">
          {cover ? (
            <PropertyPhoto
              image={cover}
              locale={lang}
              fallbackAlt={dict.property.photoOf(1, property.gallery.length)}
              sizes="(min-width: 1440px) 1312px, 100vw"
              priority
              className="hero-photo"
            />
          ) : (
            <PlatPlaceholder label={areaText ?? title} caption={dict.property.noPhotos} />
          )}
        </div>
        {photos.length > 0 && (
          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo, index) => (
              <li
                key={`${index}-${photo.ref}`}
                className="group relative aspect-4/3 overflow-hidden bg-paper-deep"
              >
                <Photo
                  image={photo}
                  locale={lang}
                  alt={dict.property.photoOf(index + 2, property.gallery.length)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-16 grid grid-cols-1 gap-14 lg:mt-20 lg:grid-cols-12 lg:gap-14">
        <aside className="lg:sticky lg:top-24 lg:order-last lg:col-span-4 lg:col-start-9 lg:self-start">
          <div className="border border-ink bg-paper p-6 sm:p-8">
            <dl aria-label={dict.property.facts}>
              <Fact label={dict.property.area}>{areaText ?? "—"}</Fact>
              <Fact label={dict.property.type}>
                {optionLabel(propertyTypes, property.propertyType, lang)}
              </Fact>
              <Fact label={dict.property.province}>{province}</Fact>
              {zone && <Fact label={dict.property.zone}>{zone}</Fact>}
              <Fact label={dict.property.price}>{dict.property.priceValue}</Fact>
            </dl>

            {sold ? (
              <div className="mt-8">
                <p>{dict.property.sold}</p>
                <Link
                  href={localizePath(lang, "properties")}
                  className="link-trace mt-3 inline-block pb-0.5 font-medium hover:text-seal"
                >
                  {dict.property.soldCta}
                </Link>
              </div>
            ) : (
              <Enquiry lang={lang} dict={dict} title={title} slug={property.slug} />
            )}
          </div>
        </aside>

        <div className="lg:col-span-7">
          {description && (
            <section aria-labelledby="descripcion" className="reveal">
              <h2 id="descripcion" className="eyebrow">
                {dict.property.description}
              </h2>
              {untranslated && (
                <p className="mt-5 text-sm text-line italic">{dict.property.translationNote}</p>
              )}
              <div
                lang={untranslated ? "es" : undefined}
                className="mt-6 max-w-[68ch] text-lg leading-relaxed whitespace-pre-line text-ink/90"
              >
                {description}
              </div>
            </section>
          )}

          {property.plan && (
            <section aria-labelledby="plano" className="reveal mt-16">
              <h2 id="plano" className="eyebrow">
                {dict.property.plan}
              </h2>
              <div className="relative mt-6 aspect-4/3 overflow-hidden border border-rule bg-paper-deep">
                <PropertyPhoto
                  image={property.plan}
                  locale={lang}
                  fallbackAlt={dict.property.plan}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-contain!"
                />
              </div>
            </section>
          )}

          <section aria-labelledby="ubicacion" className="reveal mt-16 border-t border-ink pt-8">
            <h2 id="ubicacion" className="eyebrow">
              {dict.property.location}
            </h2>
            <p className="mt-5 font-serif text-3xl">
              {[zone, province].filter(Boolean).join(", ")}
            </p>
            <p className="mt-3 text-sm text-line">{dict.property.locationNote}</p>
          </section>
        </div>
      </div>
    </article>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-rule py-3.5 first:pt-0">
      <dt className="text-[0.6875rem] font-medium tracking-[0.16em] text-line uppercase">
        {label}
      </dt>
      <dd className="text-right font-serif text-lg tabular-nums">{children}</dd>
    </div>
  );
}

function Photo({ image, locale, alt }: { image: PropertyImage; locale: Locale; alt: string }) {
  return (
    <PropertyPhoto
      image={image}
      locale={locale}
      fallbackAlt={alt}
      sizes="(min-width: 1024px) 25vw, 50vw"
      className="transition-transform duration-1000 ease-out-expo group-hover:scale-[1.04]"
    />
  );
}

type EnquiryProps = { lang: Locale; dict: Dictionary; title: string; slug: string };

function Enquiry({ lang, dict, title, slug }: EnquiryProps) {
  return (
    <div className="mt-8 flex flex-col gap-4">
      <WhatsAppSeal
        locale={lang}
        label={dict.property.enquire}
        propertyTitle={title}
        tone="solid"
        className="min-h-14"
      />
      <a
        href={`tel:${siteConfig.contact.phone.e164}`}
        className="inline-flex items-center justify-center gap-2 text-sm text-line transition-colors hover:text-ink"
      >
        <PhoneIcon width={16} height={16} />
        {dict.contact.callCta} {siteConfig.contact.phone.display}
      </a>
      <Link
        href={`${localizePath(lang, "contact")}?propiedad=${encodeURIComponent(slug)}`}
        className="link-trace mx-auto pb-0.5 text-sm text-line transition-colors hover:text-ink"
      >
        {dict.contact.writeCta}
      </Link>
      <FloatingWhatsApp locale={lang} label={dict.contact.floating} propertyTitle={title} />
    </div>
  );
}
