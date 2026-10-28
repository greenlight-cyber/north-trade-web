import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import aerialPhoto from "@/assets/home/campos-salta-aerea.jpg";
import { ArrowRightIcon, PhoneIcon } from "@/components/icons";
import { PropertyCard } from "@/components/property-card";
import { PropertySearch } from "@/components/property-search";
import { CornerMarks, SurveyFrame } from "@/components/survey-frame";
import { WhatsAppSeal } from "@/components/whatsapp-seal";
import { siteConfig } from "@/config/site";
import { pickHighlights } from "@/domain/listing";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/get-dictionary";
import { localizePath } from "@/i18n/routes";
import { getListedProperties } from "@/sanity/properties";

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
      <Hero lang={lang} dict={dict} />
      {highlights.length > 0 && (
        <section
          aria-labelledby="seleccion"
          className="mx-auto max-w-360 px-5 pb-20 sm:px-8 lg:px-16"
        >
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
            <h2 id="seleccion" className="font-serif text-3xl">
              {dict.home.highlightsTitle}
            </h2>
            <Link
              href={localizePath(lang, "properties")}
              className="group inline-flex items-center gap-2 font-medium underline decoration-1 underline-offset-[0.35em] hover:text-seal"
            >
              {dict.home.highlightsAll}
              <ArrowRightIcon className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
          <ul className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((property) => (
              <li key={property.id}>
                <PropertyCard property={property} locale={lang} dict={dict} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function Hero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section className="mx-auto grid max-w-360 grid-cols-1 gap-10 px-5 pt-8 pb-16 sm:px-8 lg:h-[clamp(40rem,calc(100dvh-4.5rem),58rem)] lg:grid-cols-[minmax(0,1.62fr)_minmax(24rem,1fr)] lg:gap-14 lg:px-16 lg:pt-12">
      <figure className="relative m-2 min-h-[18rem] lg:m-0 lg:min-h-0">
        <CornerMarks />
        <Image
          src={aerialPhoto}
          alt={dict.home.heroAlt}
          fill
          priority
          placeholder="blur"
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
        />
        <figcaption className="absolute bottom-4 left-4 border border-line bg-paper px-3 py-1.5 text-sm text-ink">
          {dict.home.heroCaption}
        </figcaption>
      </figure>

      <SurveyFrame className="flex flex-col p-6 sm:p-8 lg:p-10">
        <h1 className="text-display">{dict.home.title}</h1>
        <p className="mt-5 max-w-[46ch] text-ink/85">{dict.home.lead}</p>

        <div className="mt-8">
          <PropertySearch locale={lang} dict={dict} />
        </div>

        <div className="mt-auto flex flex-col gap-4 pt-10">
          <WhatsAppSeal locale={lang} label={dict.contact.whatsappCta} />
          <a
            href={`tel:${siteConfig.contact.phone.e164}`}
            className="inline-flex items-center justify-center gap-2 text-sm text-line hover:text-ink"
          >
            <PhoneIcon width={16} height={16} />
            {dict.contact.callCta} {siteConfig.contact.phone.display}
          </a>
        </div>
      </SurveyFrame>
    </section>
  );
}
