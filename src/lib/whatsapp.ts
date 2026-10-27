import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";

const messages: Record<Locale, { generic: string; property: (title: string) => string }> = {
  es: {
    generic: "Hola, me comunico desde la web de North Trade.",
    property: (title) =>
      `Hola, me interesa la propiedad "${title}" que vi en la web de North Trade. ¿Podrían darme más información?`,
  },
  en: {
    generic: "Hello, I'm contacting you from the North Trade website.",
    property: (title) =>
      `Hello, I'm interested in the property "${title}" I saw on the North Trade website. Could you send me more information?`,
  },
};

/** Arma el texto prellenado; si hay una propiedad, la menciona por nombre. */
export function buildWhatsAppMessage(locale: Locale, propertyTitle?: string): string {
  const title = propertyTitle?.trim();
  return title ? messages[locale].property(title) : messages[locale].generic;
}

type WhatsAppUrlOptions = {
  locale: Locale;
  propertyTitle?: string;
  number?: string;
};

/** Enlace wa.me con el mensaje ya codificado para URL. */
export function buildWhatsAppUrl({
  locale,
  propertyTitle,
  number = siteConfig.contact.whatsapp.number,
}: WhatsAppUrlOptions): string {
  const text = encodeURIComponent(buildWhatsAppMessage(locale, propertyTitle));
  // wa.me solo acepta dígitos: se descartan "+", espacios y guiones.
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${text}`;
}
