import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ArrowRightIcon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { WhatsAppSeal } from "@/components/whatsapp-seal";
import { siteConfig } from "@/config/site";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizePath } from "@/i18n/routes";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/nosotros">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return pageMetadata({
    locale: lang,
    route: "about",
    title: dict.about.title,
    description: dict.about.metaDescription,
  });
}

const container = "mx-auto max-w-360 px-5 sm:px-8 lg:px-16";

export default async function AboutPage({ params }: PageProps<"/[lang]/nosotros">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.about;
  const { contact } = siteConfig;

  return (
    <div className="pb-24 lg:pb-28">
      <PageHero backdrop="vinedo-cerros" title={t.title} />

      <section
        className={`${container} grid grid-cols-1 gap-8 pt-16 lg:grid-cols-12 lg:gap-14 lg:pt-24`}
      >
        <p className="reveal font-serif text-[clamp(1.5rem,1.1rem+1.4vw,2.5rem)] leading-[1.2] text-balance lg:col-span-8">
          {t.lead}
        </p>
        <p className="reveal max-w-[44ch] text-lg text-ink/85 lg:col-span-4 lg:pt-2">{t.body}</p>
      </section>

      <section aria-labelledby="servicios" className={`${container} mt-20 lg:mt-28`}>
        <h2 id="servicios" className="border-b border-ink pb-6 text-display">
          {t.servicesTitle}
        </h2>
        <ol>
          {t.services.map((service, index) => (
            <li
              key={service.title}
              className="reveal grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 gap-y-4 border-b border-rule py-8 lg:grid-cols-12 lg:gap-14 lg:py-10"
            >
              <span
                aria-hidden
                className="font-serif text-3xl text-seal tabular-nums lg:col-span-2 lg:text-5xl"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-3xl leading-tight lg:col-span-3 lg:text-4xl">{service.title}</h3>
              <div className="col-start-2 lg:col-span-7 lg:col-start-6">
                <p className="max-w-[52ch] text-lg text-ink/85">{service.text}</p>
                {service.areas && (
                  <ul className="mt-6 flex flex-wrap gap-3">
                    {service.areas.map((area) => (
                      <li
                        key={area}
                        className="border border-ink px-4 py-2 font-serif text-lg leading-none"
                      >
                        {area}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div
        className={`${container} mt-20 grid grid-cols-1 gap-16 lg:mt-28 lg:grid-cols-12 lg:gap-14`}
      >
        <section aria-labelledby="firma" className="reveal lg:col-span-6">
          <h2 id="firma" className="text-display">
            {t.firmTitle}
          </h2>
          <dl className="mt-10 border-t border-ink">
            <Row label={dict.footer.associations}>{siteConfig.associations.join(" · ")}</Row>
            <Row label={t.region}>{t.regionValue}</Row>
            <Row label={dict.footer.address}>
              <address className="not-italic">{contact.address.display}</address>
            </Row>
          </dl>
        </section>

        <section
          aria-labelledby="buscas"
          className="reveal flex flex-col justify-between bg-paper-deep p-8 sm:p-12 lg:col-span-5 lg:col-start-8"
        >
          <div>
            <h2 id="buscas" className="text-display">
              {t.ctaTitle}
            </h2>
            <p className="mt-5 max-w-[40ch] text-lg text-ink/85">{t.ctaText}</p>
          </div>
          <div className="mt-10 flex flex-col items-start gap-6">
            <WhatsAppSeal locale={lang} label={dict.contact.whatsappCta} />
            <Link
              href={localizePath(lang, "contact")}
              className="group link-trace inline-flex items-center gap-2 pb-0.5 font-medium hover:text-seal"
            >
              {dict.contact.writeCta}
              <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-4 border-b border-rule py-5">
      <dt className="pt-1 text-[0.6875rem] font-medium tracking-[0.16em] text-line uppercase">
        {label}
      </dt>
      <dd className="font-serif text-xl">{children}</dd>
    </div>
  );
}
