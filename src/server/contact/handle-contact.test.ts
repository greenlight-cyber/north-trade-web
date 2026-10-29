import { describe, expect, it, vi } from "vitest";

import { captchaField, honeypotField } from "@/domain/contact";

import { buildContactEmail } from "./email";
import { handleContact, type ContactDeps } from "./handle-contact";

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.set(k, v);
  return data;
};

const valid = {
  name: "Ana Pérez",
  email: "ana@example.com",
  phone: "+54 387 555-0000",
  message: "Busco un campo ganadero en Anta.",
  property: "campo-en-anta",
  lang: "es",
  [captchaField]: "token-valido",
};

const fakeDeps = (overrides: Partial<ContactDeps> = {}): ContactDeps => ({
  allowRequest: vi.fn(async () => true),
  verifyCaptcha: vi.fn(async (token: string) => token === "token-valido"),
  findProperty: vi.fn(async () => ({ title: "Campo en Anta", url: "https://x/propiedades/a" })),
  send: vi.fn(async () => {}),
  logError: vi.fn(),
  ...overrides,
});

describe("handleContact", () => {
  it("envía una consulta válida con la propiedad consultada", async () => {
    const deps = fakeDeps();
    expect(await handleContact(form(valid), deps)).toEqual({ status: "success" });
    expect(deps.send).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ana@example.com", property: "campo-en-anta" }),
      { title: "Campo en Anta", url: "https://x/propiedades/a" },
    );
  });

  it("simula éxito ante un robot sin enviar nada", async () => {
    const deps = fakeDeps();
    const result = await handleContact(form({ ...valid, [honeypotField]: "spam.com" }), deps);
    expect(result).toEqual({ status: "success" });
    expect(deps.send).not.toHaveBeenCalled();
    expect(deps.allowRequest).not.toHaveBeenCalled();
  });

  it("devuelve los errores y lo escrito, sin gastar límite ni captcha", async () => {
    const deps = fakeDeps();
    const result = await handleContact(form({ ...valid, email: "mal" }), deps);
    expect(result).toMatchObject({
      status: "invalid",
      errors: { email: "invalidEmail" },
      values: { name: "Ana Pérez", email: "mal" },
    });
    expect(deps.allowRequest).not.toHaveBeenCalled();
    expect(deps.verifyCaptcha).not.toHaveBeenCalled();
  });

  it("frena a quien superó el límite de envíos", async () => {
    const deps = fakeDeps({ allowRequest: vi.fn(async () => false) });
    const result = await handleContact(form(valid), deps);
    expect(result.status).toBe("rateLimited");
    expect(deps.send).not.toHaveBeenCalled();
  });

  it("rechaza un captcha ausente o inválido", async () => {
    const deps = fakeDeps();
    expect((await handleContact(form({ ...valid, [captchaField]: "" }), deps)).status).toBe(
      "captcha",
    );
    expect((await handleContact(form({ ...valid, [captchaField]: "otro" }), deps)).status).toBe(
      "captcha",
    );
    expect(deps.send).not.toHaveBeenCalled();
  });

  it("no gasta el límite si falta el captcha", async () => {
    const deps = fakeDeps();
    await handleContact(form({ ...valid, [captchaField]: "" }), deps);
    expect(deps.allowRequest).not.toHaveBeenCalled();
  });

  it("envía igual si no se puede leer la propiedad", async () => {
    const deps = fakeDeps({ findProperty: vi.fn(async () => Promise.reject(new Error("caído"))) });
    expect((await handleContact(form(valid), deps)).status).toBe("success");
    expect(deps.send).toHaveBeenCalledWith(expect.anything(), null);
  });

  it("si falla el mail, avisa sin detalles internos y conserva lo escrito", async () => {
    const deps = fakeDeps({ send: vi.fn(async () => Promise.reject(new Error("Resend 500"))) });
    const result = await handleContact(form(valid), deps);
    expect(result).toEqual({
      status: "error",
      values: {
        name: valid.name,
        email: valid.email,
        phone: valid.phone,
        message: valid.message,
      },
    });
    expect(deps.logError).toHaveBeenCalled();
  });
});

describe("buildContactEmail", () => {
  const message = {
    name: "Ana\nPérez",
    email: "ana@example.com",
    phone: undefined,
    message: "<b>Hola</b>",
    property: "campo-en-anta",
    lang: "en" as const,
  };

  it("arma un asunto de una sola línea con la propiedad", () => {
    const { subject } = buildContactEmail(
      message,
      { title: "Campo en Anta", url: "https://x" },
      new Date("2026-10-28T15:00:00Z"),
    );
    expect(subject).toBe("Consulta web: Campo en Anta — Ana Pérez");
  });

  it("incluye los datos y el mensaje como texto plano", () => {
    const { text } = buildContactEmail(message, null, new Date("2026-10-28T15:00:00Z"));
    expect(text).toContain("Correo: ana@example.com");
    expect(text).toContain("Teléfono: (no lo indicó)");
    expect(text).toContain("Idioma del sitio: inglés");
    expect(text).toContain("<b>Hola</b>");
    expect(text).not.toContain("Propiedad:");
  });
});
