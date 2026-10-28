import Link from "next/link";

import { localizePath } from "@/i18n/routes";

/**
 * 404 dentro del sitio (con encabezado y pie), por ejemplo una propiedad que ya no está
 * publicada. No recibe el idioma de la dirección, así que ofrece ambos.
 */
export default function NotFound() {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-24">
      <h1 className="text-4xl">Esta página no existe</h1>
      <p className="mt-4">
        Puede que la propiedad ya no esté publicada o que la dirección haya cambiado.
      </p>
      <p className="mt-2" lang="en">
        This page does not exist. The property may no longer be listed.
      </p>
      <div className="mt-8 flex flex-wrap gap-6">
        <Link href={localizePath("es", "properties")} className="underline hover:text-seal">
          Ver propiedades
        </Link>
        <Link
          href={localizePath("en", "properties")}
          lang="en"
          className="underline hover:text-seal"
        >
          See properties
        </Link>
      </div>
    </section>
  );
}
