import { describe, expect, it } from "vitest";

import { parseContact, readContactForm } from "./contact";

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.set(k, v);
  return data;
};

const valid = {
  name: "  Ana Pérez ",
  email: "ana@example.com",
  phone: "",
  message: "Busco un campo agrícola de 500 ha en Anta.",
  lang: "en",
};

describe("parseContact", () => {
  it("acepta una consulta válida y limpia los espacios", () => {
    const result = parseContact(readContactForm(form(valid)));
    expect(result).toEqual({
      ok: true,
      data: {
        name: "Ana Pérez",
        email: "ana@example.com",
        phone: undefined,
        message: valid.message,
        property: undefined,
        lang: "en",
      },
    });
  });

  it("marca un error por campo con un código traducible", () => {
    const result = parseContact(
      readContactForm(form({ name: "A", email: "ana@", phone: "abc", message: "" })),
    );
    expect(result).toEqual({
      ok: false,
      errors: {
        name: "tooShort",
        email: "invalidEmail",
        phone: "invalidPhone",
        message: "required",
      },
    });
  });

  it("trata los campos que faltan como vacíos", () => {
    const result = parseContact(readContactForm(new FormData()));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toBe("required");
  });

  it("rechaza textos demasiado largos", () => {
    const result = parseContact(readContactForm(form({ ...valid, message: "x".repeat(3001) })));
    expect(result).toMatchObject({ ok: false, errors: { message: "tooLong" } });
  });

  it("descarta una propiedad o un idioma mal formados sin rechazar la consulta", () => {
    const result = parseContact(
      readContactForm(form({ ...valid, property: "<script>", lang: "fr" })),
    );
    expect(result).toMatchObject({ ok: true, data: { property: undefined, lang: "es" } });
  });

  it("conserva una propiedad válida", () => {
    const result = parseContact(readContactForm(form({ ...valid, property: "campo-en-anta" })));
    expect(result).toMatchObject({ ok: true, data: { property: "campo-en-anta" } });
  });
});
