import "server-only";

import { createHmac } from "node:crypto";

import { z } from "zod";

import { captchaAction } from "@/domain/contact";

const turnstileResponse = z.object({
  success: z.boolean(),
  action: z.string().optional(),
});

// Claves secretas de prueba publicadas por Cloudflare (1x…AA, 2x…AA, 3x…AA).
const testSecret = /^[123]x0{33}AA$/;

/** Verifica el captcha de Cloudflare Turnstile. Ante cualquier falla, responde false. */
export async function verifyTurnstile(
  secretKey: string,
  token: string,
  ip: string | null,
): Promise<boolean> {
  const body = new URLSearchParams({ secret: secretKey, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return false;
    const result = turnstileResponse.safeParse(await response.json());
    if (!result.success || !result.data.success) return false;
    // Las claves de prueba de Cloudflare no informan la acción.
    return result.data.action === captchaAction || testSecret.test(secretKey);
  } catch {
    return false;
  }
}

/** Envíos permitidos por dirección de visita dentro de la ventana. */
export const rateLimit = { max: 5, windowSeconds: 60 * 60 } as const;

// Suma y fija el vencimiento en un solo paso: el contador nunca queda sin vencer.
const countScript =
  "local n = redis.call('INCR', KEYS[1]) if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end return n";

const countResponse = z.object({ result: z.number() });

/**
 * Cuenta los envíos de una dirección en Upstash (Redis) con una ventana fija.
 * La dirección se guarda cifrada (hash), nunca tal cual.
 * Si Upstash no responde se permite el envío: el captcha sigue protegiendo y no se pierde la consulta.
 */
export async function allowByRateLimit(
  upstash: { url: string; token: string },
  ip: string | null,
): Promise<boolean> {
  // Con clave secreta: un hash simple de una IPv4 se revierte probando todas las direcciones.
  const id = createHmac("sha256", upstash.token)
    .update(ip ?? "desconocida")
    .digest("hex")
    .slice(0, 32);
  const key = `contacto:${id}`;
  try {
    const response = await fetch(upstash.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${upstash.token}` },
      body: JSON.stringify(["EVAL", countScript, "1", key, String(rateLimit.windowSeconds)]),
      signal: AbortSignal.timeout(3_000),
    });
    if (!response.ok) throw new Error(`Upstash respondió ${response.status}`);
    return countResponse.parse(await response.json()).result <= rateLimit.max;
  } catch (error) {
    console.error("Contacto: no se pudo consultar el límite de envíos.", error);
    return true;
  }
}

/** Dirección de la visita según los encabezados que agrega Vercel. */
export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return headers.get("x-real-ip")?.trim() || forwarded || null;
}
