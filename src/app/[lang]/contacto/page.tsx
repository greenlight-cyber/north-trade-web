import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { ContactForm } from "@/components/contact-form";
import { PhoneIcon } from "@/components/icons";
import { OfficeMap } from "@/components/office-map";
import { PendingValue } from "@/components/pending-value";
import { WhatsAppSeal } from "@/components/whatsapp-seal";
import { siteConfig } from "@/config/site";
import { slugPattern } from "@/domain/contact";
import { pickLocale } from "@/domain/property";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/seo";
import { getProperty } from "@/sanity/properties";
import { getContactConfig } from "@/server/contact/config";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/contacto">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return pageMetadata({
    locale: lang,
    route: "contact",
    title: dict.contactPage.title,
    description: dict.contactPage.metaDescription,
  });
}

export default async function ContactPage({ params, searchParams }: PageProps<"/[lang]/contacto">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.contactPage;
  const { contact } = siteConfig;

  return (
    <div className="mx-auto max-w-360 px-5 pt-10 pb-24 sm:px-8 lg:px-16 lg:pt-14">
      <header className="max-w-3xl">
        <h1 className="text-display">{t.title}</h1>
        <p className="mt-5 max-w-[56ch] text-lg text-ink/85">{t.lead}</p>
      </header>

      <div className="mt-14 grid grid-cols-1 gap-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,1fr)] lg:gap-20">
        <section aria-labelledby="mensaje">
          <h2 id="mensaje" className="border-b border-ink pb-3 font-serif text-3xl">
            {t.formTitle}
          </h2>
          <div className="mt-6">
            <Suspense fallback={<div className="min-h-[36rem]" />}>
              <FormSection lang={lang} dict={dict} searchParams={searchParams} />
            </Suspense>
          </div>
        </section>

        <aside className="flex flex-col gap-14">
          <section aria-labelledby="directo" data-wa-local>
            <h2 id="directo" className="border-b border-ink pb-3 font-serif text-3xl">
              {t.directTitle}
            </h2>
            <div className="mt-6 flex flex-col gap-4">
              <WhatsAppSeal locale={lang} label={dict.contact.whatsappCta} />
              <a
                href={`tel:${contact.phone.e164}`}
                className="inline-flex items-center justify-center gap-2 text-line hover:text-ink"
              >
                <PhoneIcon width={18} height={18} />
                {dict.contact.callCta} {contact.phone.display}
              </a>
            </div>
            <dl className="mt-8 border-t border-line">
              <Row label={dict.footer.whatsapp}>{contact.whatsapp.display}</Row>
              <Row label={dict.footer.phone}>{contact.phone.display}</Row>
              <Row label={dict.footer.email}>
                <PendingValue value={contact.email} />
              </Row>
              <Row label={dict.footer.hours}>
                <PendingValue value={contact.hours} />
              </Row>
            </dl>
          </section>

          <section aria-labelledby="oficina">
            <h2 id="oficina" className="border-b border-ink pb-3 font-serif text-3xl">
              {t.officeTitle}
            </h2>
            <address className="mt-6 mb-6 text-lg not-italic">{contact.address.display}</address>
            <OfficeMap
              query={`${contact.address.street}, ${contact.address.city}, Argentina`}
              labels={{ title: t.mapTitle, show: t.mapShow, open: t.mapOpen, note: t.mapNote }}
            />
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_minmax(0,1fr)] border-b border-line py-3">
      <dt className="text-xs font-medium tracking-[0.12em] text-line uppercase">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

type FormSectionProps = {
  lang: Locale;
  dict: Dictionary;
  searchParams: PageProps<"/[lang]/contacto">["searchParams"];
};

/** Si se llega desde una ficha (?propiedad=…), la consulta queda asociada a esa propiedad. */
async function FormSection({ lang, dict, searchParams }: FormSectionProps) {
  // Se lee la configuración en cada visita, no al compilar.
  const raw = (await searchParams).propiedad;
  const setup = getContactConfig();
  if (!setup.ok) {
    return <p className="border-l-2 border-seal pl-4">{dict.form.status.unavailable}</p>;
  }

  const slug = typeof raw === "string" && slugPattern.test(raw) ? raw : null;
  const found = slug ? await getProperty(slug).catch(() => null) : null;
  const property = found ? { slug: found.slug, title: pickLocale(found.title, lang) } : undefined;

  return (
    <ContactForm
      locale={lang}
      labels={dict.form}
      siteKey={setup.config.turnstile.siteKey}
      property={property}
    />
  );
}
