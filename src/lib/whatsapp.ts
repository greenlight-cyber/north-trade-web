import { siteConfig } from "@/config/site";

const GENERIC_MESSAGE = "Hola, me comunico desde la web de North Trade.";

/** Arma el texto prellenado; si hay una propiedad, la menciona por nombre. */
export function buildWhatsAppMessage(propertyTitle?: string): string {
  const title = propertyTitle?.trim();
  if (!title) return GENERIC_MESSAGE;
  return `Hola, me interesa la propiedad "${title}" que vi en la web de North Trade. ¿Podrían darme más información?`;
}

/** Enlace wa.me con el mensaje ya codificado para URL. */
export function buildWhatsAppUrl(
  propertyTitle?: string,
  number: string = siteConfig.contact.whatsapp.number,
): string {
  const text = encodeURIComponent(buildWhatsAppMessage(propertyTitle));
  // wa.me solo acepta dígitos: se descartan "+", espacios y guiones.
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${text}`;
}
