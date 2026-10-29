import { WhatsAppIcon } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type FloatingWhatsAppProps = { locale: Locale; label: string; propertyTitle?: string };

/**
 * Botón fijo de WhatsApp. El layout dibuja el genérico; se oculta, solo con CSS, en las
 * páginas que marcan con `data-wa-local` su propio acceso a WhatsApp (la ficha dibuja
 * este mismo botón con el nombre de la propiedad; contacto ya tiene uno grande).
 */
export function FloatingWhatsApp({ locale, label, propertyTitle }: FloatingWhatsAppProps) {
  return (
    <a
      href={buildWhatsAppUrl({ locale, propertyTitle })}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      {...(propertyTitle ? { "data-wa-local": "" } : {})}
      className={`fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 inline-flex size-14 items-center justify-center gap-3 border-2 border-paper bg-seal text-paper outline-1 outline-seal transition-colors duration-200 hover:bg-seal-dark sm:size-auto sm:px-5 sm:py-3.5 print:hidden ${
        propertyTitle ? "" : "[body:has([data-wa-local])_&]:hidden"
      }`}
    >
      <WhatsAppIcon width={24} height={24} />
      <span
        aria-hidden
        className="hidden text-sm font-semibold tracking-[0.12em] uppercase sm:inline"
      >
        WhatsApp
      </span>
    </a>
  );
}
