import { describe, expect, it } from "vitest";

import { buildWhatsAppMessage, buildWhatsAppUrl } from "./whatsapp";

describe("buildWhatsAppMessage", () => {
  it("usa un mensaje genérico sin propiedad", () => {
    expect(buildWhatsAppMessage()).toBe("Hola, me comunico desde la web de North Trade.");
  });

  it("usa el mensaje genérico si el título está vacío", () => {
    expect(buildWhatsAppMessage("   ")).toBe(buildWhatsAppMessage());
  });

  it("menciona la propiedad por nombre", () => {
    expect(buildWhatsAppMessage("Campo en Anta")).toContain('"Campo en Anta"');
  });
});

describe("buildWhatsAppUrl", () => {
  it("apunta al número de North Trade por defecto", () => {
    expect(buildWhatsAppUrl()).toMatch(/^https:\/\/wa\.me\/5493876054595\?text=/);
  });

  it("codifica caracteres especiales del título", () => {
    const url = new URL(buildWhatsAppUrl("Viñedos & Bodega", "5490000000000"));
    expect(url.pathname).toBe("/5490000000000");
    expect(url.searchParams.get("text")).toContain('"Viñedos & Bodega"');
  });
});
