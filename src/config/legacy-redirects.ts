// Lo usa next.config.ts: solo importaciones relativas (el alias "@/" no existe ahí).
import migrated from "../../scripts/migracion/propiedades.json";
import { localizePath } from "../i18n/routes";

export type LegacyRedirect = { source: string; destination: string; statusCode: 301 };

const listing = localizePath("es", "properties");
const contact = localizePath("es", "contact");

/**
 * Publicaciones del sitio anterior que no se migraron (borradas antes de 2026 o sin datos
 * recuperables). Se conocen por el archivo de Internet; llevan al listado.
 */
const retiredPosts = [
  "/1-ha-sobre-camino-a-san-lorenzo-pocos-kms-de-salta-argentina",
  "/238-2",
  "/285-2",
  "/340-2",
  "/703-2",
  "/781-2",
  "/campo-agricola-desarrollado-en-las-lajitas-anta-salta-argentina",
  "/campo-agricola-en-joaquin-v-gonzalez-anta-salta-argentina",
  "/campo-agricola-en-las-lajitas-100-desarrollado",
  "/campo-sobre-ruta-colindante-con-el-dique-cabra-corral-salta-argentina",
  "/edificio-en-el-centro-de-la-ciudad-de-salta-argentina",
  "/excelente-finca-agricola-ganadera-a-pocos-kms-de-salta-argentina",
  "/finca-con-feet-lot-sobre-ruta-nac-no-5-anta-salta-argentina",
  "/finca-tabacalera-y-ganadera-en-valle-de-lerma-salta-argentina",
  "/hermosa-finca-tabacalera-y-ganadera-en-valle-de-lerma-salta-argentina",
  "/importante-bodega-y-vinedos-en-cafayate",
  "/importante-propiedad-en-el-centro-de-la-ciudad-de-salta-argentina",
  "/interesante-fraccion-de-2390m2-en-la-entrada-de-la-ciudad-de-cafayate",
  "/interesante-fraccion-en-la-entrada-a-ciudad-de-salta-argentina",
  "/linda-finca-agroganadera-a-pocos-kms-de-salta-argentina",
  "/terrenos-en-cafayate-1-000-mts2-todos-los-servicios",
];

/** Secciones del WordPress y páginas .php de una versión todavía más vieja del sitio. */
const sections: [string, string][] = [
  ["/rurales", listing],
  ["/urbanas", listing],
  ["/category/:path*", listing],
  ["/tag/:path*", listing],
  ["/clasificados.php", listing],
  ["/clasificados-campos.php", listing],
  ["/clasificados-urbanos.php", listing],
  ["/contacto.php", contact],
  ["/primera.php", "/"],
  ["/menu.php", "/"],
  ["/pie.php", "/"],
  ["/ref.php", "/"],
  ["/feed", "/"],
];

/** Sin la barra final: Next la quita antes (con un 308) y después aplica esta regla. */
const withoutTrailingSlash = (path: string) => path.replace(/\/+$/, "");

/**
 * Redirecciones 301 de las direcciones del sitio anterior. Cada propiedad migrada va a su
 * ficha nueva. Si el equipo cambia la dirección web de una propiedad en el panel, la vieja
 * deja de funcionar: muestra la página "no existe" con enlace al listado.
 */
export function legacyRedirects(): LegacyRedirect[] {
  const properties = migrated.map((p) => ({
    source: withoutTrailingSlash(p.legacyPath),
    destination: localizePath("es", "properties", p.slug),
  }));
  const retired = retiredPosts.map((source) => ({ source, destination: listing }));
  const other = sections.map(([source, destination]) => ({ source, destination }));
  return [...properties, ...retired, ...other].map((r) => ({ ...r, statusCode: 301 }));
}
