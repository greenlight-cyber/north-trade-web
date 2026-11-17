import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { PageHero } from "@/components/page-hero";
import { PendingValue } from "@/components/pending-value";
import { siteConfig } from "@/config/site";
import { isLocale, localeTags, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/privacidad">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return pageMetadata({
    locale: lang,
    route: "privacy",
    title: dict.privacyPage.title,
    description: dict.privacyPage.metaDescription,
  });
}

/** "2026-11-17" → "17 de noviembre de 2026" / "November 17, 2026". Fecha fija, sin zona horaria. */
function formatDate(isoDate: string, locale: Locale): string {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString(localeTags[locale], {
    dateStyle: "long",
    timeZone: "UTC",
  });
}

const authorityUrl = "https://www.argentina.gob.ar/aaip";

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacidad">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.privacyPage;
  const { contact, legal, privacy } = siteConfig;

  return (
    <div className="pb-24 lg:pb-28">
      <PageHero backdrop="bruma" title={t.title} lead={t.lead} />

      <div className="mx-auto max-w-360 px-5 pt-16 sm:px-8 lg:px-16 lg:pt-20">
        <div className="max-w-[72ch] text-lg text-ink/90">
          <p className="text-sm text-line">
            {t.updated}: <time dateTime={privacy.updated}>{formatDate(privacy.updated, lang)}</time>
          </p>

          <Section id="responsable" title={t.responsibleTitle}>
            <dl className="border-t border-line">
              <Row label={t.responsible}>
                <PendingValue value={legal.name} /> ({siteConfig.name})
              </Row>
              <Row label={t.taxId}>
                <PendingValue value={legal.taxId} />
              </Row>
              <Row label={t.address}>
                <address className="not-italic">{contact.address.display}</address>
              </Row>
              <Row label={t.email}>
                <PendingValue value={contact.email} />
              </Row>
            </dl>
          </Section>

          {t.sections.map((section, index) => (
            <Section key={section.title} id={`seccion-${index + 1}`} title={section.title}>
              {section.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {section.items && (
                <ul className="list-disc space-y-2 pl-6">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.after && <p>{section.after}</p>}
            </Section>
          ))}

          <Section id="conservacion" title={t.retentionTitle}>
            <p>
              {t.retentionBefore} <PendingValue value={privacy.retention} /> {t.retentionAfter}
            </p>
          </Section>

          <Section id="derechos" title={t.rightsTitle}>
            {t.rights.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Section>

          <Section id="cookies" title={t.cookiesTitle}>
            {t.cookies.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Section>

          <Section id="cambios" title={t.changesTitle}>
            <p>{t.changes}</p>
          </Section>

          <Section id="legal" title={t.legalTitle}>
            {dict.form.legalNotices.map((p) => (
              <p key={p} className="text-base">
                {p}
              </p>
            ))}
            <p className="text-base">
              <a
                href={authorityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-seal"
              >
                {t.authorityLink}
              </a>
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-14">
      <h2 id={id} className="border-b border-ink pb-4 font-serif text-3xl">
        {title}
      </h2>
      <div className="mt-6 space-y-4">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-4 border-b border-rule py-3.5">
      <dt className="pt-1 text-[0.6875rem] font-medium tracking-[0.16em] text-line uppercase">
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}
