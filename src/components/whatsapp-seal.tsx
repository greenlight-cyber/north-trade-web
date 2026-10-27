import { WhatsAppIcon } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type WhatsAppSealProps = {
  locale: Locale;
  label: string;
  propertyTitle?: string;
  className?: string;
};

/** Acción principal del sitio, con forma de sello de goma bordó. */
export function WhatsAppSeal({ locale, label, propertyTitle, className = "" }: WhatsAppSealProps) {
  return (
    <a
      href={buildWhatsAppUrl({ locale, propertyTitle })}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-12 items-center justify-center gap-3 border-2 border-seal px-6 py-3 text-sm font-semibold tracking-[0.12em] text-seal uppercase transition-colors duration-200 hover:bg-seal hover:text-paper active:bg-seal-dark ${className}`}
    >
      <WhatsAppIcon />
      {label}
    </a>
  );
}
