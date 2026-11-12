/**
 * Convierte las imágenes originales de fondo (carpeta imagenes-fondo/, fuera de git) en
 * las versiones para la web: AVIF y WebP, en un ancho para celular y otro para escritorio.
 * Escribe en public/fondos/. Usa sharp, que ya viene instalado con Next.
 *
 * Uso: npm run fondos
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";

const origen = "imagenes-fondo";
const destino = "public/fondos";

/** Nombre en la web → archivo original. */
const fondos = {
  "vinedo-uvas": "Gemini_Generated_Image_9ehj309ehj309ehj (1).jpg",
  "vinedo-cerros": "Gemini_Generated_Image_9ehj309ehj309ehj.jpg",
  ganado: "Gemini_Generated_Image_9i4wjz9i4wjz9i4w.jpg",
  cultivo: "Gemini_Generated_Image_e8fbwme8fbwme8fb.jpg",
  bruma: "Gemini_Generated_Image_mdf1vxmdf1vxmdf1.jpg",
};

// Los originales miden 1408 px de ancho: no se agrandan.
const anchos = [768, 1408];

await mkdir(destino, { recursive: true });
for (const [nombre, archivo] of Object.entries(fondos)) {
  for (const ancho of anchos) {
    const base = sharp(join(origen, archivo)).resize({ width: ancho, withoutEnlargement: true });
    await base
      .clone()
      .avif({ quality: 50, effort: 6 })
      .toFile(join(destino, `${nombre}-${ancho}.avif`));
    await base
      .clone()
      .webp({ quality: 72 })
      .toFile(join(destino, `${nombre}-${ancho}.webp`));
  }
  console.log(`listo: ${nombre}`);
}
