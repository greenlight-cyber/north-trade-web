import "server-only";

import { createClient } from "@sanity/client";
import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";

import { listedStatuses, type PropertySummary } from "@/domain/listing";
import { propertyStatuses } from "@/domain/property";

import { apiVersion, getSanityEnv } from "./env";

/** Etiqueta de caché de todas las propiedades; el webhook de Sanity la invalida. */
export const propertiesTag = "properties";

// Solo campos públicos: las notas internas y la dirección vieja nunca salen del panel.
const image = `{
  "ref": asset._ref,
  alt,
  "hotspot": hotspot{x, y},
  "lqip": asset->metadata.lqip
}`;

const summaryFields = `
  "id": _id,
  "slug": slug.current,
  title,
  status,
  category,
  propertyType,
  province,
  zone,
  areaHectares,
  "featured": coalesce(featured, false),
  "createdAt": _createdAt,
  "cover": select(defined(gallery[0].asset) => gallery[0]${image}, null)
`;

const listQuery = `*[_type == "property" && defined(slug.current) && status in $statuses]{${summaryFields}}`;

const detailQuery = `*[_type == "property" && slug.current == $slug][0]{
  ${summaryFields},
  description,
  "gallery": gallery[defined(asset)]${image},
  "plan": select(defined(plan.asset) => plan${image}, null)
}`;

const slugsQuery = `*[_type == "property" && defined(slug.current) && status in $statuses].slug.current`;

const localized = z.object({ es: z.string().nullish(), en: z.string().nullish() });

const imageSchema = z.object({
  ref: z.string(),
  alt: localized.nullable(),
  hotspot: z.object({ x: z.number(), y: z.number() }).nullable(),
  lqip: z.string().nullable(),
});

const statusValues = propertyStatuses.map((s) => s.value) as [
  (typeof propertyStatuses)[number]["value"],
  ...(typeof propertyStatuses)[number]["value"][],
];

const summarySchema = z.object({
  id: z.string(),
  slug: z.string().min(1),
  title: localized,
  status: z.enum(statusValues),
  category: z.enum(["rural", "urbana"]),
  propertyType: z.string(),
  province: z.string(),
  zone: localized.nullable(),
  areaHectares: z.number().positive().nullable(),
  featured: z.boolean(),
  createdAt: z.string(),
  cover: imageSchema.nullable(),
}) satisfies z.ZodType<PropertySummary>;

const detailSchema = summarySchema.extend({
  description: localized.nullable(),
  gallery: z
    .array(imageSchema)
    .nullable()
    .transform((g) => g ?? []),
  plan: imageSchema.nullable(),
});

export type PropertyDetail = z.infer<typeof detailSchema>;

function getClient() {
  const result = getSanityEnv();
  if (!result.ok) return null;
  return createClient({ ...result.env, apiVersion, useCdn: false, perspective: "published" });
}

/** Una propiedad mal cargada no rompe el sitio: se omite y se avisa en el registro. */
function parseEach<T>(schema: z.ZodType<T>, items: unknown[]): T[] {
  return items.flatMap((item) => {
    const parsed = schema.safeParse(item);
    if (parsed.success) return [parsed.data];
    const id = (item as { id?: unknown } | null)?.id;
    console.warn(`Propiedad omitida (${String(id)}): ${parsed.error.issues[0]?.message}`);
    return [];
  });
}

export async function getListedProperties(): Promise<PropertySummary[]> {
  "use cache";
  cacheTag(propertiesTag);
  cacheLife("hours");
  const client = getClient();
  if (!client) return [];
  const items = await client.fetch<unknown[]>(listQuery, { statuses: listedStatuses });
  return parseEach(summarySchema, items ?? []);
}

export async function getListedSlugs(): Promise<string[]> {
  "use cache";
  cacheTag(propertiesTag);
  cacheLife("hours");
  const client = getClient();
  if (!client) return [];
  const slugs = await client.fetch<unknown>(slugsQuery, { statuses: listedStatuses });
  return z.array(z.string()).catch([]).parse(slugs);
}

/** Incluye vendidas: un enlace viejo a una propiedad vendida muestra su estado en vez de un error. */
export async function getProperty(slug: string): Promise<PropertyDetail | null> {
  "use cache";
  cacheTag(propertiesTag);
  cacheLife("hours");
  const client = getClient();
  if (!client) return null;
  const item = await client.fetch<unknown>(detailQuery, { slug });
  if (!item) return null;
  return parseEach(detailSchema, [item])[0] ?? null;
}
