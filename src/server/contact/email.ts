import type { ContactMessage } from "@/domain/contact";

import type { EnquiredProperty } from "./handle-contact";

const languageNames = { es: "español", en: "inglés" } as const;

// El asunto es una sola línea: se quitan saltos y se recorta.
const oneLine = (value: string, max: number) => value.replace(/\s+/g, " ").trim().slice(0, max);

/** Arma el mail que recibe el equipo. Solo texto: lo escrito por la visita nunca se interpreta como HTML. */
export function buildContactEmail(
  message: ContactMessage,
  property: EnquiredProperty | null,
  receivedAt: Date,
) {
  const subject = property
    ? `Consulta web: ${oneLine(property.title, 80)} — ${oneLine(message.name, 60)}`
    : `Consulta web — ${oneLine(message.name, 60)}`;

  const lines = [
    `Nombre: ${message.name}`,
    `Correo: ${message.email}`,
    `Teléfono: ${message.phone ?? "(no lo indicó)"}`,
    property ? `Propiedad: ${property.title}\n${property.url}` : null,
    `Idioma del sitio: ${languageNames[message.lang]}`,
    `Recibido: ${receivedAt.toLocaleString("es-AR", { timeZone: "America/Argentina/Salta" })}`,
    "",
    "Mensaje:",
    message.message,
    "",
    "—",
    "Enviado desde el formulario de contacto de la web. Responder este correo le escribe directamente a la persona.",
  ];

  return { subject, text: lines.filter((l) => l !== null).join("\n") };
}

type ResendConfig = { apiKey: string; from: string; to: string };

/** Envía por la API de Resend. Lanza un error si Resend no confirma el envío. */
export async function sendWithResend(
  config: ResendConfig,
  email: { subject: string; text: string; replyTo: string },
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: [config.to],
      reply_to: email.replyTo,
      subject: email.subject,
      text: email.text,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    // El cuerpo puede traer datos de la cuenta: solo se registra el código.
    throw new Error(`Resend respondió ${response.status}`);
  }
}
