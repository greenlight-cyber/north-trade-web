import { siteConfig } from "@/config/site";
import { defaultShareImage } from "@/lib/seo";

// Mismo criterio que PendingValue: lo pendiente nunca se publica como dato para Google.
const known = (value: string) => (value.startsWith("[COMPLETAR") ? undefined : value);

/** Identificador estable de la firma, para que las fichas la referencien. */
export const firmId = (siteUrl: URL) => new URL("/#firma", siteUrl).toString();

/** Datos estructurados de la firma (schema.org RealEstateAgent). */
export function realEstateAgentData(siteUrl: URL, description: string) {
  const { contact } = siteConfig;
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": firmId(siteUrl),
    name: siteConfig.name,
    description,
    url: new URL("/", siteUrl).toString(),
    logo: new URL("/logotipo.png", siteUrl).toString(),
    image: new URL(defaultShareImage.url, siteUrl).toString(),
    telephone: contact.phone.e164,
    email: known(contact.email),
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address.street,
      addressLocality: contact.address.city,
      addressRegion: contact.address.region,
      postalCode: known(contact.address.postalCode),
      addressCountry: contact.address.country,
    },
    areaServed: ["Salta", "Formosa"].map((name) => ({ "@type": "AdministrativeArea", name })),
  };
}

type ListingInput = {
  siteUrl: URL;
  path: string;
  name: string;
  description: string;
  image?: string;
  zone?: string;
  province: string;
};

/**
 * Datos estructurados de una ficha (schema.org RealEstateListing). Sin precio (siempre a
 * consultar) ni fecha: en las migradas, la fecha de carga no es la de publicación real.
 */
export function realEstateListingData(input: ListingInput) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: input.name,
    description: input.description || undefined,
    url: new URL(input.path, input.siteUrl).toString(),
    image: input.image,
    contentLocation: {
      "@type": "Place",
      name: [input.zone, input.province].filter(Boolean).join(", "),
      address: {
        "@type": "PostalAddress",
        addressLocality: input.zone || undefined,
        addressRegion: input.province,
        addressCountry: "AR",
      },
    },
    provider: { "@id": firmId(input.siteUrl) },
  };
}

/**
 * Serializa para un <script type="application/ld+json">. Escapa "<" para que un texto
 * cargado en el panel (por ejemplo "</script>") no pueda cerrar la etiqueta.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
