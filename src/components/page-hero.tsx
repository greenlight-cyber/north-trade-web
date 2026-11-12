import type { ReactNode } from "react";

import { BackgroundImage, type Backdrop } from "@/components/background-image";

type PageHeroProps = {
  backdrop: Backdrop;
  title: string;
  lead?: ReactNode;
};

/**
 * Apertura de página con paisaje de fondo y el título en papel, como el hero de la
 * portada. El velo de tinta asegura el contraste del texto sobre cualquier zona de la foto.
 */
export function PageHero({ backdrop, title, lead }: PageHeroProps) {
  return (
    <header className="relative isolate overflow-hidden bg-ink text-paper">
      <BackgroundImage name={backdrop} priority className="hero-photo -z-10" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(35_32_28/0.82)_0%,rgb(35_32_28/0.45)_55%,rgb(35_32_28/0.25)_100%),linear-gradient(to_right,rgb(35_32_28/0.5),transparent_70%)]"
      />
      <div className="mx-auto grid max-w-360 grid-cols-1 items-end gap-6 px-5 pt-24 pb-14 sm:px-8 lg:grid-cols-12 lg:gap-14 lg:px-16 lg:pt-32 lg:pb-20">
        <div className="lg:col-span-7">
          <h1 className="rise text-hero">{title}</h1>
        </div>
        {lead && (
          <div className="rise max-w-[46ch] text-lg text-paper/85 [--i:2] lg:col-span-5 lg:pb-3">
            {lead}
          </div>
        )}
      </div>
    </header>
  );
}
