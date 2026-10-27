import type { StructureBuilder, StructureResolver } from "sanity/structure";

import { apiVersion } from "./env";

import { propertyStatuses } from "@/domain/property";

const filteredList = (
  S: StructureBuilder,
  title: string,
  filter: string,
  params: Record<string, string>,
) =>
  S.listItem()
    .title(title)
    .child(
      S.documentList()
        .title(title)
        .schemaType("property")
        .filter(`_type == "property" && ${filter}`)
        .params(params)
        .apiVersion(apiVersion),
    );

/** Menú del panel: todas las propiedades y atajos por categoría y estado. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("North Trade")
    .items([
      S.listItem()
        .title("Todas las propiedades")
        .child(S.documentTypeList("property").title("Todas las propiedades")),
      S.divider(),
      filteredList(S, "Rurales", "category == $category", { category: "rural" }),
      filteredList(S, "Urbanas", "category == $category", { category: "urbana" }),
      S.divider(),
      ...propertyStatuses
        .filter((s) => s.value !== "disponible")
        .map((s) => filteredList(S, s.plural, "status == $status", { status: s.value })),
    ]);
