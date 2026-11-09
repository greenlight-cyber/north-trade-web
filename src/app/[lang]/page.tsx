import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import aerialPhoto from "@/assets/home/campos-salta-aerea.jpg";
import { ArrowRightIcon, PhoneIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { PropertyCard } from "@/components/property-card";
import { PropertySearch } from "@/components/property-search";
import { WhatsAppSeal } from "@/components/whatsapp-seal";
import { siteConfig } from "@/config/site";
import { pickHighlights } from "@/domain/listing";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/get-dictionary";
import { localizePath } from "@/i18n/routes";
import { pageMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import { realEstateAgentData } from "@/lib/structured-data";
import { getListedProperties } from "@/sanity/properties";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return pageMetadata({
    locale: lang,
    route: "home",
    title: dict.meta.title,
    absoluteTitle: true,
    description: dict.meta.description,
  });
}

/** Orden de aparición escalonada de los elementos del hero. */
const step = (i: number) => ({ "--i": i }) as CSSProperties;

const container = "mx-auto max-w-360 px-5 sm:px-8 lg:px-16";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  // Si Sanity no responde, la portada se muestra igual, sin la selección.
  const properties = await getListedProperties().catch((error: unknown) => {
    console.error("Portada: no se pudieron leer las propiedades.", error);
    return [];
  });
  const highlights = pickHighlights(properties, 3);

  return (
    <>
      <JsonLd data={realEstateAgentData(getSiteUrl(), dict.meta.description)} />
      <Hero lang={lang} dict={dict} />
      <Statement lang={lang} dict={dict} />
      {highlights.length > 0 && (
        <section aria-labelledby="seleccion" className={`${container} pb-20 lg:pb-28`}>
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink pb-6">
            <div>
              <p className="eyebrow">{dict.nav.properties}</p>
              <h2 id="seleccion" className="mt-4 text-display">
                {dict.home.highlightsTitle}
              </h2>
            </div>
            <Link
              href={localizePath(lang, "properties")}
              className="group link-trace inline-flex items-center gap-2 pb-1 font-medium hover:text-seal"
            >
              {dict.home.highlightsAll}
              <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          {/* Composición asimétrica: la primera ocupa la columna ancha y alta. */}
          <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-y-12">
            {highlights.map((property, index) => (
              <li
                key={property.id}
                className={`reveal ${
                  index === 0
                    ? "sm:col-span-2 lg:col-span-7 lg:row-span-2"
                    : "lg:col-span-5 lg:col-start-8"
                }`}
              >
                <PropertyCard
                  property={property}
                  locale={lang}
                  dict={dict}
                  variant={index === 0 ? "feature" : "side"}
                  sizes={
                    index === 0
                      ? "(min-width: 1024px) 55vw, 100vw"
                      : "(min-width: 1024px) 22vw, (min-width: 640px) 50vw, 100vw"
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      )}
      <ClosingBand lang={lang} dict={dict} />
    </>
  );
}

function Hero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section aria-labelledby="portada" className="relative">
      <figure className="relative flex min-h-[clamp(32rem,calc(100svh-8.5rem),50rem)] flex-col justify-end overflow-hidden bg-ink">
        <Image
          src={aerialPhoto}
          alt={dict.home.heroAlt}
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="hero-photo object-cover"
        />
        {/* Velo de tinta desde abajo a la izquierda: da contraste al título sin tapar el paisaje. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_top,rgb(35_32_28/0.85)_0%,rgb(35_32_28/0.35)_45%,rgb(35_32_28/0.05)_75%),linear-gradient(to_right,rgb(35_32_28/0.45),transparent_60%)]"
        />
        <figcaption className="absolute top-6 right-5 bg-paper px-3 py-1.5 text-[0.6875rem] tracking-[0.16em] text-ink uppercase sm:right-8 lg:right-16">
          {dict.home.heroCaption}
        </figcaption>

        <div className={`${container} relative w-full pt-28 pb-20 sm:pb-24 lg:pt-32 lg:pb-28`}>
          <p style={step(0)} className="rise eyebrow text-paper/85 before:bg-paper/85">
            {siteConfig.contact.address.city} · Argentina
          </p>
          <h1 id="portada" style={step(1)} className="rise mt-5 max-w-[13ch] text-hero text-paper">
            {dict.home.title}
          </h1>
          <p
            style={step(2)}
            className="rise mt-6 max-w-[52ch] text-lg leading-relaxed text-paper/85"
          >
            {dict.home.lead}
          </p>
        </div>
      </figure>

      {/* El buscador monta sobre el borde de la foto, como un rótulo pegado a la lámina. */}
      <div className={`${container} relative z-10 -mt-14`}>
        <PropertySearch locale={lang} dict={dict} className="rise [--i:3]" />
        <div className="rise mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm [--i:4]">
          <WhatsAppSeal locale={lang} label={dict.contact.whatsappCta} />
          <a
            href={`tel:${siteConfig.contact.phone.e164}`}
            className="inline-flex items-center gap-2 text-line transition-colors hover:text-ink"
          >
            <PhoneIcon width={16} height={16} />
            {dict.contact.callCta} {siteConfig.contact.phone.display}
          </a>
        </div>
      </div>
    </section>
  );
}

/** Presentación breve de la firma y sus servicios, con enlace a Nosotros. */
function Statement({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.about;
  return (
    <section
      aria-labelledby="firma-portada"
      className={`${container} grid grid-cols-1 gap-10 py-20 lg:grid-cols-12 lg:gap-14 lg:py-28`}
    >
      <div className="lg:col-span-4">
        <h2 id="firma-portada" className="eyebrow">
          {dict.nav.about}
        </h2>
      </div>
      <div className="lg:col-span-8">
        <p className="reveal font-serif text-[clamp(1.75rem,1.1rem+2vw,3.25rem)] leading-[1.12] text-balance">
          {t.body}
        </p>
        <ol className="mt-14 grid grid-cols-1 border-t border-ink sm:grid-cols-3">
          {t.services.map((service, index) => (
            <li
              key={service.title}
              className="reveal border-b border-rule py-7 sm:border-b-0 sm:border-l sm:px-6 sm:first:border-l-0 sm:first:pl-0"
            >
              <span aria-hidden className="font-serif text-sm text-seal tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-xl leading-snug">{service.title}</h3>
              {service.areas && (
                <p className="mt-2 text-[0.6875rem] tracking-[0.16em] text-line uppercase">
                  {service.areas.join(" · ")}
                </p>
              )}
            </li>
          ))}
        </ol>
        <Link
          href={localizePath(lang, "about")}
          className="group link-trace mt-10 inline-flex items-center gap-2 pb-1 font-medium hover:text-seal"
        >
          {dict.home.aboutLink}
          <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}

/** Cierre en bordó: la invitación a escribir por WhatsApp antes del pie. */
function ClosingBand({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section aria-labelledby="cierre" className="bg-seal text-paper">
      <div
        className={`${container} grid grid-cols-1 items-end gap-10 py-20 lg:grid-cols-12 lg:gap-14 lg:py-28`}
      >
        <h2 id="cierre" className="reveal text-hero lg:col-span-7">
          {dict.about.ctaTitle}
        </h2>
        <div className="reveal lg:col-span-5">
          <p className="max-w-[40ch] text-lg text-paper/85">{dict.about.ctaText}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <WhatsAppSeal locale={lang} label={dict.contact.whatsappCta} tone="inverse" />
            <a
              href={`tel:${siteConfig.contact.phone.e164}`}
              className="inline-flex items-center gap-2 text-sm text-paper/85 transition-colors hover:text-paper"
            >
              <PhoneIcon width={16} height={16} />
              {dict.contact.callCta} {siteConfig.contact.phone.display}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
