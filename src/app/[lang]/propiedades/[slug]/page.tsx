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
    <div className="mx-auto max-w-360 px-5 pt-8 pb-20 sm:px-8 lg:px-16 lg:pt-10">
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

  return (
    <article>
      {listingData && <JsonLd data={listingData} />}
      <Link
        href={localizePath(lang, "properties")}
        className="group inline-flex items-center gap-2 text-sm text-line hover:text-ink"
      >
        <ArrowRightIcon className="rotate-180 transition-transform group-hover:-translate-x-1" />
        {dict.property.back}
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(20rem,1fr)] lg:gap-14">
        <section aria-label={dict.property.photos} className="flex flex-col gap-4">
          <div className="relative aspect-4/3 overflow-hidden border border-line bg-paper-deep">
            {cover ? (
              <PropertyPhoto
                image={cover}
                locale={lang}
                fallbackAlt={dict.property.photoOf(1, property.gallery.length)}
                sizes="(min-width: 1024px) 60vw, 100vw"
                priority
              />
            ) : (
              <PlatPlaceholder label={areaText ?? title} caption={dict.property.noPhotos} />
            )}
          </div>
          {photos.length > 0 && (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {photos.map((photo, index) => (
                <li
                  key={`${index}-${photo.ref}`}
                  className="relative aspect-4/3 overflow-hidden border border-line"
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

        <aside className="lg:sticky lg:top-6 lg:self-start">
          {status && property.status !== "disponible" && (
            <p className="mb-4 inline-block border border-seal px-2 py-1 text-xs font-semibold tracking-[0.12em] text-seal uppercase">
              {status.label[lang]}
            </p>
          )}
          <h1 className="font-serif text-4xl leading-tight text-balance lg:text-5xl">{title}</h1>
          <p className="mt-3 text-line">{[zone, province].filter(Boolean).join(" · ")}</p>

          <dl aria-label={dict.property.facts} className="mt-8 border-t border-line">
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
                className="mt-3 inline-block font-medium underline underline-offset-4 hover:text-seal"
              >
                {dict.property.soldCta}
              </Link>
            </div>
          ) : (
            <Enquiry lang={lang} dict={dict} title={title} slug={property.slug} />
          )}
        </aside>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(20rem,1fr)] lg:gap-14">
        <div>
          {description && (
            <section aria-labelledby="descripcion">
              <h2 id="descripcion" className="border-b border-line pb-3 font-serif text-2xl">
                {dict.property.description}
              </h2>
              {untranslated && (
                <p className="mt-4 text-sm text-line italic">{dict.property.translationNote}</p>
              )}
              <div
                lang={untranslated ? "es" : undefined}
                className="mt-5 max-w-[70ch] leading-relaxed whitespace-pre-line text-ink/90"
              >
                {description}
              </div>
            </section>
          )}

          {property.plan && (
            <section aria-labelledby="plano" className="mt-12">
              <h2 id="plano" className="border-b border-line pb-3 font-serif text-2xl">
                {dict.property.plan}
              </h2>
              <div className="relative mt-5 aspect-4/3 overflow-hidden border border-line">
                <PropertyPhoto
                  image={property.plan}
                  locale={lang}
                  fallbackAlt={dict.property.plan}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-contain!"
                />
              </div>
            </section>
          )}
        </div>

        <section aria-labelledby="ubicacion">
          <h2 id="ubicacion" className="border-b border-line pb-3 font-serif text-2xl">
            {dict.property.location}
          </h2>
          <p className="mt-5 text-lg">{[zone, province].filter(Boolean).join(", ")}</p>
          <p className="mt-2 text-sm text-line">{dict.property.locationNote}</p>
        </section>
      </div>
    </article>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_minmax(0,1fr)] border-b border-line py-3">
      <dt className="text-xs font-medium tracking-[0.12em] text-line uppercase">{label}</dt>
      <dd className="tabular-nums">{children}</dd>
    </div>
  );
}

function Photo({ image, locale, alt }: { image: PropertyImage; locale: Locale; alt: string }) {
  return (
    <PropertyPhoto
      image={image}
      locale={locale}
      fallbackAlt={alt}
      sizes="(min-width: 1024px) 20vw, 50vw"
    />
  );
}

type EnquiryProps = { lang: Locale; dict: Dictionary; title: string; slug: string };

function Enquiry({ lang, dict, title, slug }: EnquiryProps) {
  return (
    <div className="mt-8 flex flex-col gap-4">
      <WhatsAppSeal locale={lang} label={dict.property.enquire} propertyTitle={title} />
      <a
        href={`tel:${siteConfig.contact.phone.e164}`}
        className="inline-flex items-center justify-center gap-2 text-sm text-line hover:text-ink"
      >
        <PhoneIcon width={16} height={16} />
        {dict.contact.callCta} {siteConfig.contact.phone.display}
      </a>
      <Link
        href={`${localizePath(lang, "contact")}?propiedad=${encodeURIComponent(slug)}`}
        className="text-center text-sm text-line underline hover:text-ink"
      >
        {dict.contact.writeCta}
      </Link>
      <FloatingWhatsApp locale={lang} label={dict.contact.floating} propertyTitle={title} />
    </div>
  );
}
