import { esESLocale } from "@sanity/locale-es-es";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { apiVersion, type SanityPublicEnv } from "./env";
import { schemaTypes } from "./schemas";
import { structure } from "./structure";

/**
 * Configuración del panel de carga que se abre en /admin. Recibe los datos del
 * proyecto ya validados por la página, que muestra un aviso si faltan.
 */
export function createStudioConfig(env: SanityPublicEnv) {
  return defineConfig({
    name: "north-trade",
    title: "North Trade · Panel",
    basePath: "/admin",
    projectId: env.projectId,
    dataset: env.dataset,
    apiVersion,
    plugins: [structureTool({ structure }), esESLocale()],
    schema: { types: schemaTypes },
  });
}
