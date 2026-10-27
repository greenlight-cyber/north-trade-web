import { describe, expect, it } from "vitest";

import { buildWhatsAppMessage, buildWhatsAppUrl } from "./whatsapp";

describe("buildWhatsAppMessage", () => {
  it("usa un mensaje genérico sin propiedad", () => {
    expect(buildWhatsAppMessage("es")).toBe("Hola, me comunico desde la web de North Trade.");
  });

  it("usa el mensaje genérico si el título está vacío", () => {
    expect(buildWhatsAppMessage("es", "   ")).toBe(buildWhatsAppMessage("es"));
  });

  it("menciona la propiedad por nombre", () => {
    expect(buildWhatsAppMessage("es", "Campo en Anta")).toContain('"Campo en Anta"');
  });

  it("escribe el mensaje en inglés en la versión inglesa", () => {
    expect(buildWhatsAppMessage("en", "Campo en Anta")).toMatch(/^Hello, I'm interested/);
  });
});

describe("buildWhatsAppUrl", () => {
  it("apunta al número de North Trade por defecto", () => {
    expect(buildWhatsAppUrl({ locale: "es" })).toMatch(/^https:\/\/wa\.me\/5493876054595\?text=/);
  });

  it("codifica caracteres especiales del título", () => {
    const url = new URL(
      buildWhatsAppUrl({
        locale: "es",
        propertyTitle: "Viñedos & Bodega",
        number: "5490000000000",
      }),
    );
    expect(url.pathname).toBe("/5490000000000");
    expect(url.searchParams.get("text")).toContain('"Viñedos & Bodega"');
  });

  it("descarta símbolos del número", () => {
    const url = buildWhatsAppUrl({ locale: "es", number: "+54 9 387 605-4595" });
    expect(url).toMatch(/^https:\/\/wa\.me\/5493876054595\?/);
  });
});
