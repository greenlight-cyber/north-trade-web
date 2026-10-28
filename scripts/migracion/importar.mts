/**
 * Carga en Sanity las propiedades recuperadas del sitio anterior.
 *
 *   npm run migrar               → solo muestra lo que haría (no escribe nada)
 *   npm run migrar -- --confirmar → descarga las fotos y crea las propiedades
 *
 * Necesita SANITY_API_WRITE_TOKEN en .env.local (ver .env.example).
 * Si algo falla, se puede volver a correr: las propiedades ya cargadas no se tocan.
 * Cuando termina sin errores deja una marca en Sanity y no vuelve a ejecutarse.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@sanity/client";

import { apiVersion, readSanityEnv } from "../../src/sanity/env.ts";
import {
  documentId,
  parseMigratedProperties,
  toSanityDocument,
  type UploadedImage,
} from "./datos.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const cacheDir = path.join(here, ".cache");
const confirm = process.argv.includes("--confirmar");
const completedMarkerId = "migracion-sitio-anterior";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Descarga una foto del archivo de Internet (con reintentos: la conexión suele cortarse). */
async function downloadImage(url: string): Promise<Buffer> {
  const cached = path.join(cacheDir, createHash("sha1").update(url).digest("hex"));
  try {
    return await readFile(cached);
  } catch {
    // No estaba descargada todavía.
  }
  let lastError: unknown;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(120_000) });
      const type = response.headers.get("content-type") ?? "";
      if (!response.ok || !type.startsWith("image/")) {
        throw new Error(`respuesta ${response.status} (${type || "sin tipo"})`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      // Se escribe aparte y se renombra: un corte a mitad no deja una foto rota en la caché.
      await writeFile(`${cached}.tmp`, buffer);
      await rename(`${cached}.tmp`, cached);
      return buffer;
    } catch (error) {
      lastError = error;
      if (attempt < 4) await sleep(5_000 * attempt);
    }
  }
  throw new Error(`No se pudo descargar ${url}: ${String(lastError)}`);
}

async function main() {
  const properties = parseMigratedProperties(
    JSON.parse(await readFile(path.join(here, "propiedades.json"), "utf8")),
  );
  const withPhotos = properties.filter((p) => p.images.length).length;
  console.log(`${properties.length} propiedades válidas (${withPhotos} con foto).`);

  if (!confirm) {
    for (const p of properties) {
      console.log(`  ${documentId(p)}  ${p.title.es}  [${p.images.length} foto/s]`);
    }
    console.log("\nSimulación: no se escribió nada. Para cargar, agregá --confirmar.");
    return;
  }

  const env = readSanityEnv(process.env);
  const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
  if (!token) throw new Error("Falta SANITY_API_WRITE_TOKEN en .env.local (ver .env.example).");

  const client = createClient({ ...env, apiVersion, token, useCdn: false });

  // Una vez completa, la migración no se vuelve a correr: si no, recrearía las
  // propiedades que el equipo haya borrado a propósito.
  if (await client.getDocument(completedMarkerId)) {
    console.log("La migración ya se completó antes; no se hace nada.");
    return;
  }
  await mkdir(cacheDir, { recursive: true });

  const failed: string[] = [];
  for (const [index, p] of properties.entries()) {
    const label = `[${index + 1}/${properties.length}] ${p.title.es}`;
    try {
      if (await client.getDocument(documentId(p))) {
        console.log(`${label}: ya existe, no se modifica.`);
        continue;
      }
      const images: UploadedImage[] = [];
      for (const image of p.images) {
        const buffer = await downloadImage(image.archive);
        // Sanity reconoce archivos idénticos y no los duplica.
        const asset = await client.assets.upload("image", buffer, {
          filename: path.basename(new URL(image.source).pathname),
          source: { name: "sitio-anterior", id: image.source, url: image.archive },
        });
        images.push({ assetId: asset._id, alt: image.alt });
      }
      await client.createIfNotExists(toSanityDocument(p, images));
      console.log(`${label}: cargada (${images.length} foto/s).`);
    } catch (error) {
      failed.push(p.slug);
      console.error(`${label}: ERROR ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (failed.length) {
    console.error(
      `\nFallaron ${failed.length}: ${failed.join(", ")}. Volvé a correr el comando para reintentar.`,
    );
    process.exitCode = 1;
  } else {
    // Documento interno (no aparece en el panel) que marca la migración como hecha.
    await client.createIfNotExists({
      _id: completedMarkerId,
      _type: "migrationRun",
      completedAt: new Date().toISOString(),
      properties: properties.length,
    });
    console.log("\nListo: todas las propiedades están en Sanity.");
  }
}

await main();
