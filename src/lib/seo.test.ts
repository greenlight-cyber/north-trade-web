import { describe, expect, it } from "vitest";

import { contentSecurityPolicy } from "@/config/security-headers";

import { languageAlternates, pageMetadata } from "./seo";
import { realEstateAgentData, realEstateListingData, serializeJsonLd } from "./structured-data";

describe("languageAlternates", () => {
  it("enlaza la versión de cada idioma y usa el español por defecto", () => {
    expect(languageAlternates("properties", "campo-en-anta")).toEqual({
      "es-AR": "/propiedades/campo-en-anta",
      en: "/en/properties/campo-en-anta",
      "x-default": "/propiedades/campo-en-anta",
    });
    expect(languageAlternates("home")).toEqual({ "es-AR": "/", en: "/en", "x-default": "/" });
  });
});

describe("pageMetadata", () => {
  it("arma canónica, Open Graph completo e imagen por defecto", () => {
    const meta = pageMetadata({
      locale: "en",
      route: "about",
      title: "About us",
      description: "Desc",
    });
    expect(meta.alternates?.canonical).toBe("/en/about");
    expect(meta.openGraph).toMatchObject({
      url: "/en/about",
      title: "About us · North Trade",
      locale: "en_US",
      images: [{ url: "/og-north-trade.jpg", width: 1200, height: 630 }],
    });
    expect(meta.robots).toBeUndefined();
  });

  it("respeta un título completo y marca noindex cuando se pide", () => {
    const meta = pageMetadata({
      locale: "es",
      route: "home",
      title: "North Trade · Inmobiliaria rural",
      absoluteTitle: true,
      description: "Desc",
      noIndex: true,
    });
    expect(meta.title).toEqual({ absolute: "North Trade · Inmobiliaria rural" });
    expect(meta.openGraph?.title).toBe("North Trade · Inmobiliaria rural");
    expect(meta.robots).toEqual({ index: false, follow: true });
  });
});

describe("datos estructurados", () => {
  const site = new URL("https://www.northtrade.com.ar");

  it("no publica datos pendientes de la firma", () => {
    const json = JSON.stringify(realEstateAgentData(site, "Inmobiliaria rural"));
    expect(json).not.toContain("COMPLETAR");
    expect(json).toContain("Toribio Tedín 77");
  });

  it("referencia la firma desde la ficha, sin precio", () => {
    const data = realEstateListingData({
      siteUrl: site,
      path: "/propiedades/campo",
      name: "Campo",
      description: "",
      province: "Salta",
    });
    expect(data).toMatchObject({
      url: "https://www.northtrade.com.ar/propiedades/campo",
      provider: { "@id": "https://www.northtrade.com.ar/#firma" },
    });
    expect(JSON.stringify(data)).not.toMatch(/price|offers|datePosted/i);
  });

  it("no deja cerrar la etiqueta script desde un texto cargado", () => {
    expect(serializeJsonLd({ name: "</script><script>alert(1)</script>" })).not.toContain("<");
  });
});

describe("contentSecurityPolicy", () => {
  it("solo permite eval en desarrollo", () => {
    expect(contentSecurityPolicy({ dev: false })).not.toContain("unsafe-eval");
    expect(contentSecurityPolicy({ dev: true })).toContain("unsafe-eval");
  });

  it("habilita el captcha y el mapa, y prohíbe ser mostrado en marcos ajenos", () => {
    const csp = contentSecurityPolicy({ dev: false });
    expect(csp).toContain("frame-src https://challenges.cloudflare.com https://www.google.com");
    expect(csp).toContain("frame-ancestors 'none'");
  });
});
