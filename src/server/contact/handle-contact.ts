import {
  contactFields,
  parseContact,
  readContactForm,
  type ContactField,
  type ContactMessage,
  type ContactState,
} from "@/domain/contact";

export type EnquiredProperty = { title: string; url: string };

/** Servicios externos que usa el formulario; los tests los reemplazan por versiones falsas. */
export type ContactDeps = {
  /** true si la dirección de la visita todavía puede enviar. */
  allowRequest: () => Promise<boolean>;
  verifyCaptcha: (token: string) => Promise<boolean>;
  findProperty: (slug: string) => Promise<EnquiredProperty | null>;
  send: (message: ContactMessage, property: EnquiredProperty | null) => Promise<void>;
  logError: (message: string, error?: unknown) => void;
};

const keepValues = (raw: Record<ContactField, string>) =>
  Object.fromEntries(contactFields.map((f) => [f, raw[f]])) as Record<ContactField, string>;

/**
 * Procesa un envío: trampa para robots, validación, límite por visita, captcha y mail,
 * en ese orden (de lo más barato a lo más caro). Nunca devuelve detalles internos.
 */
export async function handleContact(formData: FormData, deps: ContactDeps): Promise<ContactState> {
  const raw = readContactForm(formData);

  // Un robot completó el campo invisible: se le responde "enviado" para no darle pistas.
  if (raw.honeypot.trim()) return { status: "success" };

  const parsed = parseContact(raw);
  if (!parsed.ok) return { status: "invalid", errors: parsed.errors, values: keepValues(raw) };

  // Sin captcha (el widget todavía no terminó) no se gasta un envío del límite.
  if (!raw.captchaToken) return { status: "captcha", values: keepValues(raw) };

  try {
    if (!(await deps.allowRequest())) return { status: "rateLimited", values: keepValues(raw) };
    if (!(await deps.verifyCaptcha(raw.captchaToken))) {
      return { status: "captcha", values: keepValues(raw) };
    }

    const slug = parsed.data.property;
    const property = slug
      ? await deps.findProperty(slug).catch((error: unknown) => {
          // Sin el nombre de la propiedad la consulta igual sirve.
          deps.logError("Contacto: no se pudo leer la propiedad consultada.", error);
          return null;
        })
      : null;

    await deps.send(parsed.data, property);
    return { status: "success" };
  } catch (error) {
    deps.logError("Contacto: falló el envío de la consulta.", error);
    return { status: "error", values: keepValues(raw) };
  }
}
