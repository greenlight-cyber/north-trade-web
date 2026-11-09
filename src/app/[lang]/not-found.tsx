import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";
import { localizePath } from "@/i18n/routes";

/**
 * 404 dentro del sitio (con encabezado y pie), por ejemplo una propiedad que ya no está
 * publicada. No recibe el idioma de la dirección, así que ofrece ambos.
 */
export default function NotFound() {
  const link =
    "group link-trace inline-flex items-center gap-2 pb-0.5 font-medium transition-colors hover:text-seal";
  return (
    <section className="mx-auto w-full max-w-360 px-5 py-24 sm:px-8 lg:px-16 lg:py-36">
      <p className="eyebrow">404</p>
      <h1 className="mt-5 max-w-[14ch] text-hero">Esta página no existe</h1>
      <p className="mt-8 max-w-[52ch] text-lg text-ink/85">
        Puede que la propiedad ya no esté publicada o que la dirección haya cambiado.
      </p>
      <p className="mt-2 max-w-[52ch] text-line" lang="en">
        This page does not exist. The property may no longer be listed.
      </p>
      <div className="mt-10 flex flex-wrap gap-8">
        <Link href={localizePath("es", "properties")} className={link}>
          Ver propiedades
          <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
        <Link href={localizePath("en", "properties")} lang="en" className={link}>
          See properties
          <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
