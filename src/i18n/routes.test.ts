import { describe, expect, it } from "vitest";

import { localizePath, resolveLocaleRoute, switchLocalePath, toPublicPath } from "./routes";

describe("localizePath", () => {
  it("arma direcciones en español sin prefijo", () => {
    expect(localizePath("es", "home")).toBe("/");
    expect(localizePath("es", "properties")).toBe("/propiedades");
    expect(localizePath("es", "properties", "campo-en-anta")).toBe("/propiedades/campo-en-anta");
  });

  it("arma direcciones en inglés con prefijo y nombres traducidos", () => {
    expect(localizePath("en", "home")).toBe("/en");
    expect(localizePath("en", "contact")).toBe("/en/contact");
    expect(localizePath("en", "properties", "campo-en-anta")).toBe("/en/properties/campo-en-anta");
  });
});

describe("resolveLocaleRoute", () => {
  it("sirve el español desde la carpeta interna /es", () => {
    expect(resolveLocaleRoute("/")).toEqual({ action: "rewrite", pathname: "/es" });
    expect(resolveLocaleRoute("/propiedades/x")).toEqual({
      action: "rewrite",
      pathname: "/es/propiedades/x",
    });
  });

  it("redirige /es/... a la forma sin prefijo", () => {
    expect(resolveLocaleRoute("/es")).toEqual({ action: "redirect", pathname: "/" });
    expect(resolveLocaleRoute("/es/contacto")).toEqual({
      action: "redirect",
      pathname: "/contacto",
    });
  });

  it("traduce los nombres públicos en inglés a las carpetas internas", () => {
    expect(resolveLocaleRoute("/en")).toEqual({ action: "rewrite", pathname: "/en" });
    expect(resolveLocaleRoute("/en/properties/x")).toEqual({
      action: "rewrite",
      pathname: "/en/propiedades/x",
    });
  });

  it("redirige nombres en español usados bajo /en a su versión inglesa", () => {
    expect(resolveLocaleRoute("/en/propiedades/x")).toEqual({
      action: "redirect",
      pathname: "/en/properties/x",
    });
  });

  it("deja pasar direcciones desconocidas bajo /en (terminan en 404)", () => {
    expect(resolveLocaleRoute("/en/no-existe")).toEqual({ action: "next" });
  });
});

describe("switchLocalePath", () => {
  it("pasa de español a inglés", () => {
    expect(switchLocalePath("/", "en")).toBe("/en");
    expect(switchLocalePath("/propiedades/campo", "en")).toBe("/en/properties/campo");
  });

  it("pasa de inglés a español", () => {
    expect(switchLocalePath("/en", "es")).toBe("/");
    expect(switchLocalePath("/en/about", "es")).toBe("/nosotros");
  });

  it("mantiene la página si ya está en el idioma pedido", () => {
    expect(switchLocalePath("/contacto", "es")).toBe("/contacto");
  });

  it("acepta la ruta interna reescrita que devuelve usePathname", () => {
    expect(switchLocalePath("/es", "en")).toBe("/en");
    expect(switchLocalePath("/es/propiedades/campo", "en")).toBe("/en/properties/campo");
    expect(switchLocalePath("/en/propiedades", "es")).toBe("/propiedades");
  });
});

describe("toPublicPath", () => {
  it("convierte rutas internas a su forma pública", () => {
    expect(toPublicPath("/es")).toBe("/");
    expect(toPublicPath("/es/nosotros")).toBe("/nosotros");
    expect(toPublicPath("/en/propiedades/x")).toBe("/en/properties/x");
  });

  it("deja igual las rutas que ya son públicas", () => {
    expect(toPublicPath("/propiedades")).toBe("/propiedades");
    expect(toPublicPath("/en/about")).toBe("/en/about");
  });
});
