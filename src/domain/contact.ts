import { z } from "zod";

import { locales } from "@/i18n/config";

import { slugPattern } from "./property";

/** Campos visibles del formulario de contacto. */
export const contactFields = ["name", "email", "phone", "message", "consent"] as const;
export type ContactField = (typeof contactFields)[number];

/** Campo oculto con la fecha de la política de privacidad que vio la visita. */
export const privacyVersionField = "privacyVersion";

/** Valor que envía el navegador cuando la casilla de consentimiento está marcada. */
export const consentValue = "on";

/** Campo trampa: invisible para personas, los robots lo completan. */
export const honeypotField = "sitio_web";

/** Nombre del campo que agrega el captcha de Cloudflare al formulario. */
export const captchaField = "cf-turnstile-response";

/** Acción con la que se dibuja el captcha; el servidor la exige al verificar. */
export const captchaAction = "contacto";

export type ContactErrorCode =
  "required" | "tooShort" | "tooLong" | "invalidEmail" | "invalidPhone" | "consentRequired";

export type ContactStatus =
  "idle" | "success" | "invalid" | "captcha" | "rateLimited" | "unavailable" | "error";

/** Lo único que vuelve al navegador: un estado y, si hay errores, lo que escribió la persona. */
export type ContactState = {
  status: ContactStatus;
  errors?: Partial<Record<ContactField, ContactErrorCode>>;
  values?: Partial<Record<ContactField, string>>;
};

export const contactLimits = { name: 100, email: 200, phone: 40, message: 3000 } as const;

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: "tooLong" satisfies ContactErrorCode });

export const contactSchema = z.object({
  name: text(contactLimits.name)
    .min(1, { error: "required" satisfies ContactErrorCode })
    .min(2, { error: "tooShort" satisfies ContactErrorCode }),
  email: text(contactLimits.email)
    .min(1, { error: "required" satisfies ContactErrorCode })
    .pipe(z.email({ error: "invalidEmail" satisfies ContactErrorCode })),
  phone: text(contactLimits.phone)
    .regex(/^[+\d\s().-]*$/, { error: "invalidPhone" satisfies ContactErrorCode })
    .transform((v) => v || undefined),
  message: text(contactLimits.message)
    .min(1, { error: "required" satisfies ContactErrorCode })
    .min(10, { error: "tooShort" satisfies ContactErrorCode }),
  // Ley 25.326, art. 5: sin consentimiento expreso no se procesa la consulta.
  consent: z
    .literal(consentValue, { error: "consentRequired" satisfies ContactErrorCode })
    .transform(() => true as const),
  // Datos de contexto: si llegan mal se descartan en lugar de rechazar la consulta.
  property: z.string().max(200).regex(slugPattern).optional().catch(undefined),
  lang: z.enum(locales).catch("es"),
  // Fecha (AAAA-MM-DD) de la política mostrada junto a la casilla; si falta, se usa la vigente.
  privacyVersion: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .catch(undefined),
});

export type ContactMessage = z.infer<typeof contactSchema>;

/** Toma los valores del formulario; lo que no es texto cuenta como vacío. */
export function readContactForm(formData: FormData) {
  const get = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  return {
    name: get("name"),
    email: get("email"),
    phone: get("phone"),
    message: get("message"),
    consent: get("consent"),
    property: get("property") || undefined,
    lang: get("lang"),
    privacyVersion: get(privacyVersionField) || undefined,
    honeypot: get(honeypotField),
    captchaToken: get(captchaField),
  };
}

export type ParsedContact =
  { ok: true; data: ContactMessage } | { ok: false; errors: NonNullable<ContactState["errors"]> };

export function parseContact(raw: ReturnType<typeof readContactForm>): ParsedContact {
  const parsed = contactSchema.safeParse(raw);
  if (parsed.success) return { ok: true, data: parsed.data };
  const errors: NonNullable<ContactState["errors"]> = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0];
    if (contactFields.includes(field as ContactField) && !errors[field as ContactField]) {
      errors[field as ContactField] = issue.message as ContactErrorCode;
    }
  }
  return { ok: false, errors };
}
