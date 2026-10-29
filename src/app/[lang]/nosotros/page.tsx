import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ArrowRightIcon } from "@/components/icons";
import { PendingValue } from "@/components/pending-value";
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

export default async function AboutPage({ params }: PageProps<"/[lang]/nosotros">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.about;
  const { contact, trust } = siteConfig;

  return (
    <div className="mx-auto max-w-360 px-5 pt-10 pb-24 sm:px-8 lg:px-16 lg:pt-14">
      <header className="max-w-4xl">
        <h1 className="text-display">{t.title}</h1>
        <p className="mt-6 font-serif text-2xl leading-snug text-balance lg:text-3xl">{t.lead}</p>
        <p className="mt-6 max-w-[60ch] text-lg text-ink/85">{t.body}</p>
      </header>

      <section aria-labelledby="servicios" className="mt-20">
        <h2 id="servicios" className="border-b border-ink pb-3 font-serif text-3xl">
          {t.servicesTitle}
        </h2>
        <ol className="grid grid-cols-1 md:grid-cols-3">
          {t.services.map((service, index) => (
            <li
              key={service.title}
              className="border-b border-line py-8 md:border-b-0 md:border-l md:px-8 md:first:border-l-0 md:first:pl-0"
            >
              <span aria-hidden className="font-serif text-lg text-seal tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-2xl">{service.title}</h3>
              <p className="mt-3 text-ink/85">{service.text}</p>
              {index === t.services.length - 1 && (
                <p className="mt-3 text-sm">
                  <PendingValue value={t.advisoryDetail} />
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-20 grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
        <section aria-labelledby="firma">
          <h2 id="firma" className="border-b border-ink pb-3 font-serif text-3xl">
            {t.firmTitle}
          </h2>
          <dl>
            <Row label={dict.footer.trajectory}>
              <PendingValue value={trust.yearsInBusiness} />
            </Row>
            <Row label={dict.footer.license}>
              <PendingValue value={trust.license} />
            </Row>
            <Row label={t.region}>{t.regionValue}</Row>
            <Row label={dict.footer.address}>
              <address className="not-italic">{contact.address.display}</address>
            </Row>
          </dl>
        </section>

        <section aria-labelledby="buscas" className="border border-line p-6 sm:p-10">
          <h2 id="buscas" className="font-serif text-3xl">
            {t.ctaTitle}
          </h2>
          <p className="mt-3 text-ink/85">{t.ctaText}</p>
          <div className="mt-8 flex flex-col items-start gap-5">
            <WhatsAppSeal locale={lang} label={dict.contact.whatsappCta} />
            <Link
              href={localizePath(lang, "contact")}
              className="group inline-flex items-center gap-2 font-medium underline decoration-1 underline-offset-[0.35em] hover:text-seal"
            >
              {dict.contact.writeCta}
              <ArrowRightIcon className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_minmax(0,1fr)] border-b border-line py-4">
      <dt className="text-xs font-medium tracking-[0.12em] text-line uppercase">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
