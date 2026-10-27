import { defineField, defineType } from "sanity";

/**
 * Textos en dos idiomas. El español es obligatorio; el inglés es opcional y,
 * si falta, el sitio en inglés muestra el texto en español.
 */
export const localizedString = defineType({
  name: "localizedString",
  title: "Texto en dos idiomas",
  type: "object",
  fields: [
    defineField({
      name: "es",
      title: "Español",
      type: "string",
      validation: (rule) => rule.required().error("El texto en español es obligatorio."),
    }),
    defineField({ name: "en", title: "Inglés (opcional)", type: "string" }),
  ],
  options: { columns: 2 },
});

export const localizedText = defineType({
  name: "localizedText",
  title: "Texto largo en dos idiomas",
  type: "object",
  fields: [
    defineField({
      name: "es",
      title: "Español",
      type: "text",
      rows: 8,
      validation: (rule) => rule.required().error("El texto en español es obligatorio."),
    }),
    defineField({ name: "en", title: "Inglés (opcional)", type: "text", rows: 8 }),
  ],
});
