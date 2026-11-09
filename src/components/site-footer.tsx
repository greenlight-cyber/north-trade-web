import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import logo from "@/assets/brand/logotipo.png";
import { PendingValue } from "@/components/pending-value";
import { WhatsAppSeal } from "@/components/whatsapp-seal";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { localizePath } from "@/i18n/routes";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type SiteFooterProps = { locale: Locale; dict: Dictionary };

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 border-b border-rule py-3">
      <dt className="pt-0.5 text-[0.6875rem] font-medium tracking-[0.16em] text-line uppercase">
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

/**
 * Pie de página en papel oscuro, como el rótulo de un plano: el logo y, al lado, los
 * datos reales de la firma.
 */
export function SiteFooter({ locale, dict }: SiteFooterProps) {
  const { contact } = siteConfig;
  const f = dict.footer;
  const linkHover = "transition-colors hover:text-seal";

  return (
    <footer className="mt-auto border-t border-ink bg-paper-deep text-ink">
      <div className="mx-auto max-w-360 px-5 pt-16 pb-10 sm:px-8 lg:px-16 lg:pt-20">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <Image src={logo} alt={siteConfig.name} width={175} height={41} className="h-auto" />
            <p className="mt-6 max-w-[24ch] font-serif text-2xl leading-tight text-balance">
              {f.tagline}
            </p>
            <WhatsAppSeal locale={locale} label={dict.contact.whatsappCta} className="mt-8" />
          </div>

          <nav aria-label={dict.a11y.footerNav} className="lg:col-span-3">
            <ul className="space-y-3">
              {(["properties", "about", "contact"] as const).map((key) => (
                <li key={key}>
                  <Link
                    href={localizePath(locale, key)}
                    className="link-trace pb-0.5 font-serif text-xl transition-colors hover:text-seal"
                  >
                    {dict.nav[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <dl aria-label={f.titleBlock} className="border-t border-ink lg:col-span-4">
            <Row label={f.address}>
              <address className="not-italic">{contact.address.display}</address>
            </Row>
            <Row label={f.phone}>
              <a href={`tel:${contact.phone.e164}`} className={linkHover}>
                {contact.phone.display}
              </a>
            </Row>
            <Row label={f.whatsapp}>
              <a
                href={buildWhatsAppUrl({ locale })}
                className={linkHover}
                target="_blank"
                rel="noopener noreferrer"
              >
                {contact.whatsapp.display}
              </a>
            </Row>
            <Row label={f.email}>
              <PendingValue value={contact.email} />
            </Row>
            <Row label={f.associations}>{siteConfig.associations.join(" · ")}</Row>
          </dl>
        </div>

        <div className="mt-16 flex flex-wrap items-baseline justify-between gap-4 border-t border-rule pt-6 text-sm text-line">
          <p>
            © {siteConfig.name}. {f.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
