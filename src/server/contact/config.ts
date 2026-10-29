import "server-only";

import { z } from "zod";

const required = z.string().trim().min(1);

const envSchema = z.object({
  RESEND_API_KEY: required,
  // Admite "Nombre <correo@dominio>" o solo el correo.
  CONTACT_FROM_EMAIL: required,
  CONTACT_TO_EMAIL: z.email(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: required,
  TURNSTILE_SECRET_KEY: required,
  UPSTASH_REDIS_REST_URL: z.url({ protocol: /^https$/ }),
  UPSTASH_REDIS_REST_TOKEN: required,
});

export type ContactConfig = {
  resend: { apiKey: string; from: string; to: string };
  turnstile: { siteKey: string; secretKey: string };
  upstash: { url: string; token: string };
};

/**
 * Lee la configuración del formulario. Si falta algo, el formulario no se muestra
 * (la página ofrece WhatsApp y teléfono) y se registra qué variable falta, nunca su valor.
 */
export function getContactConfig(): { ok: true; config: ContactConfig } | { ok: false } {
  const parsed = envSchema.safeParse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  if (!parsed.success) {
    const missing = [...new Set(parsed.error.issues.map((i) => String(i.path[0])))];
    console.warn(`Formulario de contacto desactivado. Revisar: ${missing.join(", ")}`);
    return { ok: false };
  }
  const env = parsed.data;
  return {
    ok: true,
    config: {
      resend: {
        apiKey: env.RESEND_API_KEY,
        from: env.CONTACT_FROM_EMAIL,
        to: env.CONTACT_TO_EMAIL,
      },
      turnstile: {
        siteKey: env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        secretKey: env.TURNSTILE_SECRET_KEY,
      },
      upstash: {
        url: env.UPSTASH_REDIS_REST_URL.replace(/\/+$/, ""),
        token: env.UPSTASH_REDIS_REST_TOKEN,
      },
    },
  };
}
