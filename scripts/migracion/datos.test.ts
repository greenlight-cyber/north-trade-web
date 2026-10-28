import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  documentId,
  parseMigratedProperties,
  toSanityDocument,
  type MigratedProperty,
} from "./datos";

const file = JSON.parse(
  readFileSync(new URL("./propiedades.json", import.meta.url), "utf8"),
) as unknown[];

const sample = (overrides: Partial<MigratedProperty> = {}): MigratedProperty => ({
  legacyId: 1,
  legacyPath: "/campo-viejo/",
  archivedPage: "https://web.archive.org/web/2020/http://www.northtrade.com.ar/campo-viejo/",
  slug: "campo-de-prueba",
  title: { es: "Campo de prueba", en: "Test farm" },
  category: "rural",
  propertyType: "agricola",
  province: "salta",
  zone: { es: "Anta" },
  areaHectares: 100,
  description: { es: "Campo plano." },
  images: [],
  notes: ["Revisar."],
  ...overrides,
});

describe("propiedades.json", () => {
  it("es válido y trae las 51 propiedades del sitio anterior", () => {
    expect(parseMigratedProperties(file)).toHaveLength(51);
  });

  it("cubre las direcciones viejas que necesitan redirección", () => {
    const paths = parseMigratedProperties(file).map((p) => p.legacyPath);
    for (const old of [
      "/campos-en-salta/",
      "/campos-en-formosa/",
      "/importantes-campos-armados/",
      "/terrenos-en-cafayate-salta/",
      "/excelente-campo-agricola-en-anta/",
      "/cafayate-barrio-abierto-los-aromos/",
    ]) {
      expect(paths).toContain(old);
    }
  });
});

describe("parseMigratedProperties", () => {
  it("rechaza descripciones con precio", () => {
    expect(() =>
      parseMigratedProperties([sample({ description: { es: "Precio: u$s 100." } })]),
    ).toThrow(/precio/);
  });

  it("rechaza slugs repetidos", () => {
    expect(() =>
      parseMigratedProperties([sample(), sample({ legacyId: 2, legacyPath: "/otro/" })]),
    ).toThrow(/slug repetido/);
  });

  it("rechaza tipo y categoría incompatibles", () => {
    expect(() => parseMigratedProperties([sample({ propertyType: "urbana" })])).toThrow(
      /categoría/,
    );
  });

  it("rechaza fotos que no vienen del archivo de Internet", () => {
    const images = [
      {
        source: "http://x.com/a.jpg",
        archive: "https://otro-sitio.com/a.jpg",
        alt: { es: "Foto" },
      },
    ];
    expect(() => parseMigratedProperties([sample({ images })])).toThrow();
  });
});

describe("toSanityDocument", () => {
  it("arma un documento publicado con id fijo y notas internas", () => {
    const doc = toSanityDocument(sample(), [
      { assetId: "image-abc-10x10-jpg", alt: { es: "Foto" } },
    ]);
    expect(doc._id).toBe(documentId(sample()));
    expect(doc._id).not.toMatch(/^drafts\./);
    expect(doc.slug.current).toBe("campo-de-prueba");
    expect(doc.status).toBe("disponible");
    expect(doc.gallery).toEqual([
      {
        _type: "photo",
        _key: "foto1",
        asset: { _type: "reference", _ref: "image-abc-10x10-jpg" },
        alt: { _type: "localizedString", es: "Foto" },
      },
    ]);
    expect(doc.internalNotes).toContain("• Revisar.");
  });

  it("omite la superficie cuando no hay dato", () => {
    expect(toSanityDocument(sample({ areaHectares: null }), [])).not.toHaveProperty("areaHectares");
  });
});
