import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

import { propertiesTag } from "@/sanity/properties";

/**
 * Webhook de Sanity: al publicar, despublicar o borrar una propiedad, el sitio
 * descarta su copia en caché y la próxima visita ya ve el cambio.
 * La firma se verifica con SANITY_REVALIDATE_SECRET (ver .env.example).
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    console.error("Webhook de Sanity: falta SANITY_REVALIDATE_SECRET.");
    return Response.json({ ok: false }, { status: 500 });
  }

  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(request, secret, true);
    if (!isValidSignature) return Response.json({ ok: false }, { status: 401 });
    if (body?._type !== "property") return Response.json({ ok: true, revalidated: false });

    // Sin margen: un cambio de estado (por ejemplo, «vendida») tiene que verse enseguida.
    revalidateTag(propertiesTag, { expire: 0 });
    return Response.json({ ok: true, revalidated: true });
  } catch (error) {
    console.error("Webhook de Sanity: no se pudo procesar.", error);
    return Response.json({ ok: false }, { status: 400 });
  }
}
