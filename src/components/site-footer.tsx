import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import logo from "@/assets/brand/logotipo.png";
import { PendingValue } from "@/components/pending-value";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { localizePath } from "@/i18n/routes";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type SiteFooterProps = { locale: Locale; dict: Dictionary };

function Cell({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={`border-t border-l border-line px-4 py-3 ${wide ? "sm:col-span-2" : ""}`}>
      <dt className="text-xs font-medium tracking-[0.12em] text-line uppercase">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

/**
 * Pie de página con forma de rótulo de plano: el cuadro donde el agrimensor
 * firma con nombre, domicilio y matrícula. Aquí van los datos reales de la firma.
 */
export function SiteFooter({ locale, dict }: SiteFooterProps) {
  const { contact } = siteConfig;
  const f = dict.footer;

  return (
    <footer className="mt-auto border-t border-ink bg-paper-deep">
      <div className="mx-auto max-w-360 px-5 py-14 sm:px-8 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <Image src={logo} alt={siteConfig.name} width={175} height={41} className="h-auto" />
            <p className="mt-2 max-w-xs text-line">{f.tagline}</p>
            <ul className="mt-8 space-y-2">
              {(["properties", "about", "contact"] as const).map((key) => (
                <li key={key}>
                  <Link href={localizePath(locale, key)} className="underline hover:text-seal">
                    {dict.nav[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <dl
            aria-label={f.titleBlock}
            className="grid border-r border-b border-line sm:grid-cols-2"
          >
            <Cell label={f.firm} wide>
              <span className="font-serif text-xl">{siteConfig.name}</span>
            </Cell>
            <Cell label={f.address}>
              <address className="not-italic">{contact.address.display}</address>
            </Cell>
            <Cell label={f.phone}>
              <a href={`tel:${contact.phone.e164}`} className="hover:text-seal">
                {contact.phone.display}
              </a>
            </Cell>
            <Cell label={f.whatsapp}>
              <a
                href={buildWhatsAppUrl({ locale })}
                className="hover:text-seal"
                target="_blank"
                rel="noopener noreferrer"
              >
                {contact.whatsapp.display}
              </a>
            </Cell>
            <Cell label={f.email}>
              <PendingValue value={contact.email} />
            </Cell>
            <Cell label={f.hours}>
              <PendingValue value={contact.hours} />
            </Cell>
            <Cell label={f.associations}>{siteConfig.associations.join(" · ")}</Cell>
          </dl>
        </div>

        <p className="mt-12 border-t border-rule pt-6 text-sm text-line">
          © {siteConfig.name}. {f.rights}
        </p>
      </div>
    </footer>
  );
}
