import { createImageUrlBuilder } from "@sanity/image-url";

import { SanityImage } from "@/components/sanity-image";
import type { PropertyImage } from "@/domain/listing";
import { pickLocale } from "@/domain/property";
import type { Locale } from "@/i18n/config";
import { getSanityEnv } from "@/sanity/env";

type PropertyPhotoProps = {
  image: PropertyImage;
  locale: Locale;
  /** Texto alternativo si la foto no tiene uno cargado. */
  fallbackAlt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

function imageUrl(ref: string): string | null {
  const result = getSanityEnv();
  if (!result.ok) return null;
  return createImageUrlBuilder(result.env).image(ref).url();
}

/** Foto de una propiedad que cubre su contenedor, respetando el punto de interés marcado en el panel. */
export function PropertyPhoto({
  image,
  locale,
  fallbackAlt,
  sizes,
  priority = false,
  className = "",
}: PropertyPhotoProps) {
  const src = imageUrl(image.ref);
  if (!src) return null;
  const position = image.hotspot
    ? `${Math.round(image.hotspot.x * 100)}% ${Math.round(image.hotspot.y * 100)}%`
    : undefined;
  return (
    <SanityImage
      src={src}
      alt={pickLocale(image.alt, locale) || fallbackAlt}
      fill
      sizes={sizes}
      priority={priority}
      placeholder={image.lqip ? "blur" : "empty"}
      blurDataURL={image.lqip ?? undefined}
      className={`object-cover ${className}`}
      style={position ? { objectPosition: position } : undefined}
    />
  );
}
