/**
 * Datos públicos del negocio. Única fuente de verdad para encabezado, pie,
 * página de contacto, metadatos y datos estructurados.
 *
 * Los valores con el prefijo "[COMPLETAR" están pendientes de confirmar por
 * North Trade y se muestran tal cual en el sitio para que sean visibles.
 */
export const siteConfig = {
  name: "North Trade",
  tagline: "Negocios inmobiliarios en Salta, Argentina",
  description:
    "Inmobiliaria rural de Salta. Compra y venta de campos en Salta, Formosa y el norte argentino, con asesoramiento integral, seriedad y absoluta reserva.",
  url: "https://www.northtrade.com.ar",
  locale: "es_AR",
  contact: {
    address: {
      street: "Toribio Tedín 77",
      city: "Salta",
      region: "Salta",
      postalCode: "[COMPLETAR: código postal]",
      country: "AR",
      display: "Toribio Tedín 77, Salta Capital",
    },
    phone: {
      display: "+54 387 422-8546",
      e164: "+543874228546",
    },
    whatsapp: {
      display: "+54 387 605-4595",
      // Formato internacional sin "+" ni espacios, como lo pide wa.me.
      number: "5493876054595",
    },
    email: "[COMPLETAR: email de contacto]",
  },
  /** Entidades de las que North Trade es socia. Los logos están pendientes. */
  associations: ["CUCIS", "CAIR"],
} as const;

export type SiteConfig = typeof siteConfig;
