import { WhatsAppIcon } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type WhatsAppSealProps = {
  locale: Locale;
  label: string;
  propertyTitle?: string;
  /** "inverse": en blanco papel, para fondos bordó. "solid": bordó lleno, acción principal. */
  tone?: "seal" | "inverse" | "solid";
  className?: string;
};

const tones = {
  seal: "border-seal text-seal hover:bg-seal hover:text-paper active:bg-seal-dark",
  inverse: "border-paper text-paper hover:bg-paper hover:text-seal focus-visible:outline-paper",
  solid: "border-seal bg-seal text-paper hover:border-seal-dark hover:bg-seal-dark",
};

/** Acción principal del sitio, con forma de sello de goma bordó. */
export function WhatsAppSeal({
  locale,
  label,
  propertyTitle,
  tone = "seal",
  className = "",
}: WhatsAppSealProps) {
  return (
    <a
      href={buildWhatsAppUrl({ locale, propertyTitle })}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-12 items-center justify-center gap-3 border-2 px-6 py-3 text-sm font-semibold tracking-[0.12em] uppercase transition-colors duration-300 ${tones[tone]} ${className}`}
    >
      <WhatsAppIcon />
      {label}
    </a>
  );
}
