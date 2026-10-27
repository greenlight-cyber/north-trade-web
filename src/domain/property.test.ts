import { describe, expect, it } from "vitest";

import { formatArea, pickLocale } from "./property";

describe("pickLocale", () => {
  it("devuelve el texto del idioma pedido", () => {
    expect(pickLocale({ es: "Campo", en: "Farm" }, "en")).toBe("Farm");
    expect(pickLocale({ es: "Campo", en: "Farm" }, "es")).toBe("Campo");
  });

  it("cae al español si falta la traducción", () => {
    expect(pickLocale({ es: "Campo" }, "en")).toBe("Campo");
    expect(pickLocale({ es: "Campo", en: "  " }, "en")).toBe("Campo");
    expect(pickLocale({ es: "Campo", en: null }, "en")).toBe("Campo");
  });

  it("devuelve vacío si no hay valor", () => {
    expect(pickLocale(undefined, "es")).toBe("");
  });
});

describe("formatArea", () => {
  it("usa separador de miles según el idioma", () => {
    expect(formatArea(2831, "es")).toEqual({ value: "2.831", unit: "ha" });
    expect(formatArea(2831, "en")).toEqual({ value: "2,831", unit: "ha" });
  });

  it("muestra decimales de hectárea", () => {
    expect(formatArea(1.5, "es")).toEqual({ value: "1,5", unit: "ha" });
  });

  it("pasa a m² por debajo de una hectárea", () => {
    expect(formatArea(0.239, "es")).toEqual({ value: "2.390", unit: "m²" });
    expect(formatArea(0.99996, "es")).toEqual({ value: "1", unit: "ha" });
  });

  it("devuelve null sin dato o con valores inválidos", () => {
    expect(formatArea(undefined, "es")).toBeNull();
    expect(formatArea(0, "es")).toBeNull();
    expect(formatArea(-5, "es")).toBeNull();
    expect(formatArea(Number.NaN, "es")).toBeNull();
    expect(formatArea(0.00001, "es")).toBeNull();
  });
});
