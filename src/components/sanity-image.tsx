"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";

// Sanity redimensiona y elige el formato (WebP/AVIF) en su propio CDN; fit=max nunca agranda
// una foto chica.
const sanityLoader: ImageLoader = ({ src, width, quality }) =>
  `${src}?w=${width}&q=${quality ?? 75}&fit=max&auto=format`;

/** `next/image` servido desde el CDN de Sanity. El cargador es una función: vive en el cliente. */
export function SanityImage({ alt, ...props }: Omit<ImageProps, "loader">) {
  return <Image loader={sanityLoader} alt={alt} {...props} />;
}
