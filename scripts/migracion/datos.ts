import { z } from "zod";

import { propertyTypes, provinces } from "../../src/config/catalog.ts";

/** Una propiedad recuperada del sitio anterior, tal como está en propiedades.json. */
const localized = z.object({
  es: z.string().trim().min(1),
  en: z.string().trim().min(1).optional(),
});

const values = (items: { value: string }[]) => items.map((i) => i.value) as [string, ...string[]];

export const migratedPropertySchema = z.object({
  legacyId: z.number().int().positive(),
  legacyPath: z.string().regex(/^\/[a-z0-9-]+\/$/),
  archivedPage: z.url(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: localized,
  category: z.enum(["rural", "urbana"]),
  propertyType: z.enum(values(propertyTypes)),
  province: z.enum(values(provinces)),
  zone: localized,
  areaHectares: z.number().positive().nullable(),
  description: z.object({ es: z.string().trim().min(1) }),
  images: z.array(
    z.object({
      source: z.url(),
      archive: z.url({ protocol: /^https$/, hostname: /^web\.archive\.org$/ }),
      alt: localized,
    }),
  ),
  notes: z.array(z.string().min(1)),
});

export type MigratedProperty = z.infer<typeof migratedPropertySchema>;

// Los precios nunca se publican (siempre «Consultar»), así que no pueden colarse en los textos.
const pricePattern = /\bprecio\b|u\$[sd]|us\$|\busd\b|d[oó]lar|\$\s?\d/i;

/** Valida el archivo completo y las reglas que cruzan varias propiedades. */
export function parseMigratedProperties(input: unknown): MigratedProperty[] {
  const list = z.array(migratedPropertySchema).parse(input);
  const problems: string[] = [];

  const seen = {
    slug: new Set<string>(),
    legacyPath: new Set<string>(),
    legacyId: new Set<number>(),
  };
  for (const p of list) {
    for (const key of ["slug", "legacyPath", "legacyId"] as const) {
      const set = seen[key] as Set<string | number>;
      if (set.has(p[key])) problems.push(`${key} repetido: ${p[key]}`);
      set.add(p[key]);
    }
    if ((p.propertyType === "urbana") !== (p.category === "urbana")) {
      problems.push(`${p.slug}: el tipo no coincide con la categoría`);
    }
    if (pricePattern.test(p.title.es) || pricePattern.test(p.description.es))
      problems.push(`${p.slug}: el título o la descripción menciona un precio`);
    if (
      p.areaHectares !== null &&
      Math.round(p.areaHectares * 10_000) / 10_000 !== p.areaHectares
    ) {
      problems.push(`${p.slug}: la superficie tiene más de 4 decimales`);
    }
  }
  if (problems.length)
    throw new Error(`propiedades.json no es válido:\n- ${problems.join("\n- ")}`);
  return list;
}

/** Id fijo por propiedad: volver a correr la migración no crea duplicados. */
export const documentId = (p: MigratedProperty) => `migrado-${p.legacyId}`;

export type UploadedImage = { assetId: string; alt: MigratedProperty["images"][number]["alt"] };

const localizedValue = (
  type: "localizedString" | "localizedText",
  v: { es: string; en?: string },
) => ({
  _type: type,
  es: v.es,
  ...(v.en ? { en: v.en } : {}),
});

/** Documento de Sanity para una propiedad migrada (todas quedan «Disponible» hasta que el equipo las revise). */
export function toSanityDocument(p: MigratedProperty, images: UploadedImage[]) {
  return {
    _id: documentId(p),
    _type: "property",
    title: localizedValue("localizedString", p.title),
    slug: { _type: "slug", current: p.slug },
    status: "disponible",
    category: p.category,
    propertyType: p.propertyType,
    province: p.province,
    zone: localizedValue("localizedString", p.zone),
    ...(p.areaHectares !== null ? { areaHectares: p.areaHectares } : {}),
    featured: false,
    description: localizedValue("localizedText", p.description),
    gallery: images.map((image, index) => ({
      _type: "photo",
      _key: `foto${index + 1}`,
      asset: { _type: "reference", _ref: image.assetId },
      alt: localizedValue("localizedString", image.alt),
    })),
    legacyPath: p.legacyPath,
    internalNotes: [
      "Migrada del sitio anterior (copia del archivo de Internet):",
      p.archivedPage,
      "",
      ...p.notes.map((n) => `• ${n}`),
    ].join("\n"),
  };
}
