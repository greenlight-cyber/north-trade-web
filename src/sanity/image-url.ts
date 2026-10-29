import { createImageUrlBuilder } from "@sanity/image-url";

import { getSanityEnv } from "./env";

function builder() {
  const result = getSanityEnv();
  return result.ok ? createImageUrlBuilder(result.env) : null;
}

/** Dirección base de una foto en el CDN de Sanity; el tamaño lo agrega el cargador de next/image. */
export function sanityImageUrl(ref: string): string | null {
  return builder()?.image(ref).url() ?? null;
}

/** Foto recortada a 1200×630 en JPG, el formato que esperan WhatsApp y las redes al compartir. */
export function shareImageUrl(ref: string): string | null {
  return (
    builder()?.image(ref).width(1200).height(630).fit("crop").format("jpg").quality(80).url() ??
    null
  );
}
