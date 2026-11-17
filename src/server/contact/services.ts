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

/**
 * Tope de mails por día (hora de Salta) para todo el sitio, aunque lleguen de muchas
 * direcciones distintas. Holgado para consultas reales; frena una ola de spam antes de
 * agotar la cuota de Resend. Solo cuentan los mails enviados de verdad.
 */
export const dailyLimit = { max: 50 } as const;

// El contador de cada día se borra solo al día siguiente.
const dailyKeySeconds = 2 * 24 * 60 * 60;

type Upstash = { url: string; token: string };

// Suma y fija el vencimiento en un solo paso: el contador nunca queda sin vencer.
const countScript =
  "local n = redis.call('INCR', KEYS[1]) if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end return n";

const countResponse = z.object({ result: z.number() });
const readResponse = z.object({ result: z.coerce.number().nullable() });

/** Envía un comando a Upstash (Redis) por su API REST y devuelve el cuerpo de la respuesta. */
async function upstashCommand(upstash: Upstash, command: string[]): Promise<unknown> {
  const response = await fetch(upstash.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${upstash.token}` },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(3_000),
  });
  if (!response.ok) throw new Error(`Upstash respondió ${response.status}`);
  return response.json();
}

/** Suma uno al contador `key` con vencimiento fijo y devuelve el total. */
async function increment(upstash: Upstash, key: string, seconds: number): Promise<number> {
  const body = await upstashCommand(upstash, ["EVAL", countScript, "1", key, String(seconds)]);
  return countResponse.parse(body).result;
}

/**
 * Límite por dirección de visita. Se guarda un código seudónimo (hash con clave) de la
 * dirección, nunca la dirección. Si Upstash no responde se permite el envío: el captcha
 * sigue protegiendo y no se pierde la consulta.
 */
export async function allowByRateLimit(upstash: Upstash, ip: string | null): Promise<boolean> {
  // Con clave secreta: un hash simple de una IPv4 se revierte probando todas las direcciones.
  const id = createHmac("sha256", upstash.token)
    .update(ip ?? "desconocida")
    .digest("hex")
    .slice(0, 32);
  try {
    return (await increment(upstash, `contacto:${id}`, rateLimit.windowSeconds)) <= rateLimit.max;
  } catch (error) {
    console.error("Contacto: no se pudo consultar el límite de envíos.", error);
    return true;
  }
}

/** Contador del día en Salta: "contacto:total:2026-11-17". Se renueva a medianoche. */
export function dailyKey(now: Date): string {
  const day = now.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Salta" });
  return `contacto:total:${day}`;
}

/** true si hoy todavía no se llegó al tope de mails. Solo lee: no suma nada. */
export async function allowByDailyLimit(upstash: Upstash, now: Date): Promise<boolean> {
  try {
    const sent = readResponse.parse(await upstashCommand(upstash, ["GET", dailyKey(now)])).result;
    return (sent ?? 0) < dailyLimit.max;
  } catch (error) {
    console.error("Contacto: no se pudo consultar el tope diario.", error);
    return true;
  }
}

/** Anota un mail enviado en el contador del día. Si falla, solo se registra. */
export async function recordDailySend(upstash: Upstash, now: Date): Promise<void> {
  try {
    await increment(upstash, dailyKey(now), dailyKeySeconds);
  } catch (error) {
    console.error("Contacto: no se pudo anotar el envío en el tope diario.", error);
  }
}

/** Dirección de la visita según los encabezados que agrega Vercel. */
export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return headers.get("x-real-ip")?.trim() || forwarded || null;
}
