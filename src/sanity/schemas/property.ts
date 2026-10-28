import { defineArrayMember, defineField, defineType } from "sanity";

import { propertyTypes, provinces } from "@/config/catalog";
import { formatArea, propertyStatuses } from "@/domain/property";

const toOptions = (items: { value: string; label: { es: string } }[]) =>
  items.map((i) => ({ value: i.value, title: i.label.es }));

/** Imagen con texto alternativo obligatorio (accesibilidad y buscadores). */
const imageWithAlt = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "image",
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        title: "Descripción de la imagen",
        description:
          "Qué se ve en la foto, para personas con lectores de pantalla y para Google. Ej.: «Vista aérea de los lotes agrícolas».",
        type: "localizedString",
        validation: (rule) => rule.required(),
      }),
    ],
  });

export const property = defineType({
  name: "property",
  title: "Propiedad",
  type: "document",
  groups: [
    { name: "main", title: "Datos principales", default: true },
    { name: "text", title: "Descripción" },
    { name: "media", title: "Fotos y plano" },
    { name: "advanced", title: "Avanzado" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Título",
      description: "Ej.: «2.831 ha agrícolas en Chaguaral».",
      type: "localizedString",
      group: "main",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Dirección web",
      description:
        "Se genera desde el título con el botón «Generar». No la cambie una vez publicada.",
      type: "slug",
      group: "main",
      options: { source: "title.es", maxLength: 96 },
      validation: (rule) => rule.required().error("Genere la dirección web desde el título."),
    }),
    defineField({
      name: "status",
      title: "Estado",
      type: "string",
      group: "main",
      initialValue: "disponible",
      options: {
        list: propertyStatuses.map((s) => ({ value: s.value, title: s.label.es })),
        layout: "radio",
        direction: "horizontal",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Categoría",
      type: "string",
      group: "main",
      initialValue: "rural",
      options: {
        list: [
          { value: "rural", title: "Rural" },
          { value: "urbana", title: "Urbana" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "propertyType",
      title: "Tipo",
      type: "string",
      group: "main",
      options: { list: toOptions(propertyTypes) },
      validation: (rule) => [
        rule.required(),
        // El tipo «Urbana» y la categoría «Urbana» tienen que coincidir.
        rule.custom((type, context) => {
          const category = (context.document as { category?: string } | undefined)?.category;
          if (!type || !category) return true;
          return (type === "urbana") === (category === "urbana")
            ? true
            : "El tipo no coincide con la categoría (Rural / Urbana).";
        }),
      ],
    }),
    defineField({
      name: "province",
      title: "Provincia",
      type: "string",
      group: "main",
      options: { list: toOptions(provinces) },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "zone",
      title: "Zona (departamento o localidad)",
      description: "Ej.: «Anta», «Cafayate». Por reserva, nunca la ubicación exacta.",
      type: "localizedString",
      group: "main",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "areaHectares",
      title: "Superficie (hectáreas)",
      description:
        "Solo el número. Para terrenos chicos, en hectáreas con decimales: 2.390 m² = 0,239 ha (el sitio lo muestra en m²).",
      type: "number",
      group: "main",
      validation: (rule) => [
        rule.positive().error("La superficie debe ser mayor que cero."),
        rule.precision(4).error("Use como máximo 4 decimales."),
      ],
    }),
    defineField({
      name: "featured",
      title: "Destacar en la portada",
      type: "boolean",
      group: "main",
      initialValue: false,
    }),
    defineField({
      name: "summary",
      title: "Resumen",
      description: "Una o dos líneas que aparecen en el listado.",
      type: "localizedString",
      group: "text",
    }),
    defineField({
      name: "description",
      title: "Descripción completa",
      type: "localizedText",
      group: "text",
    }),
    defineField({
      name: "features",
      title: "Características",
      description: "Una por renglón. Ej.: «Riego por canal», «Casa principal», «Monte nativo».",
      type: "array",
      group: "text",
      of: [defineArrayMember({ type: "localizedString" })],
    }),
    defineField({
      name: "gallery",
      title: "Fotos",
      description: "La primera es la foto principal. Arrastre para cambiar el orden.",
      type: "array",
      group: "media",
      of: [defineArrayMember(imageWithAlt("photo", "Foto"))],
      options: { layout: "grid" },
      // Aviso y no error: varias propiedades migradas no tienen foto recuperable y
      // un error impediría corregir su texto hasta conseguirla. Lleva required()
      // porque, sin él, Sanity no avisa cuando la galería no tiene ningún valor.
      validation: (rule) => rule.required().min(1).warning("Cargue al menos una foto."),
    }),
    defineField({ ...imageWithAlt("plan", "Plano o imagen satelital"), group: "media" }),
    defineField({
      name: "legacyPath",
      title: "Dirección en el sitio anterior",
      description: "Solo para propiedades migradas: permite redirigir los enlaces viejos.",
      type: "string",
      group: "advanced",
      readOnly: true,
    }),
    defineField({
      name: "internalNotes",
      title: "Notas internas",
      description: "Solo para el equipo: nunca se muestran en el sitio.",
      type: "text",
      rows: 4,
      group: ["main", "advanced"],
    }),
  ],
  preview: {
    select: {
      title: "title.es",
      status: "status",
      zone: "zone.es",
      area: "areaHectares",
      media: "gallery.0",
    },
    prepare({ title, status, zone, area, media }) {
      const size = formatArea(area, "es");
      const statusLabel = propertyStatuses.find((s) => s.value === status)?.label.es;
      const parts = [zone, size && `${size.value} ${size.unit}`, statusLabel].filter(Boolean);
      return { title, subtitle: parts.join(" · "), media };
    },
  },
  orderings: [
    {
      title: "Más recientes",
      name: "createdDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
    {
      title: "Superficie (mayor a menor)",
      name: "areaDesc",
      by: [{ field: "areaHectares", direction: "desc" }],
    },
  ],
});
