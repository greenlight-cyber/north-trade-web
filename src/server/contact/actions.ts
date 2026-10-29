"use server";

import { headers } from "next/headers";

import type { ContactState } from "@/domain/contact";
import { pickLocale } from "@/domain/property";
import { localizePath } from "@/i18n/routes";
import { getSiteUrl } from "@/lib/site-url";
import { getProperty } from "@/sanity/properties";

import { getContactConfig } from "./config";
import { buildContactEmail, sendWithResend } from "./email";
import { handleContact } from "./handle-contact";
import { allowByRateLimit, clientIp, verifyTurnstile } from "./services";

/** Recibe el formulario de contacto. Cualquiera puede llamarla: todo se valida acá. */
export async function sendContact(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const setup = getContactConfig();
  if (!setup.ok) return { status: "unavailable" };
  const { config } = setup;
  const ip = clientIp(await headers());

  return handleContact(formData, {
    allowRequest: () => allowByRateLimit(config.upstash, ip),
    verifyCaptcha: (token) => verifyTurnstile(config.turnstile.secretKey, token, ip),
    findProperty: async (slug) => {
      const property = await getProperty(slug);
      if (!property) return null;
      // El equipo lee en castellano: título y enlace de la ficha en español.
      const url = new URL(localizePath("es", "properties", property.slug), getSiteUrl());
      return { title: pickLocale(property.title, "es"), url: url.toString() };
    },
    send: (message, property) => {
      const email = buildContactEmail(message, property, new Date());
      return sendWithResend(config.resend, { ...email, replyTo: message.email });
    },
    logError: (message, error) => console.error(message, error),
  });
}
