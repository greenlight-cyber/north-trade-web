import { describe, expect, it } from "vitest";

import migrated from "../../scripts/migracion/propiedades.json";
import { routes } from "../i18n/routes";

import { legacyRedirects } from "./legacy-redirects";

const redirects = legacyRedirects();

describe("legacyRedirects", () => {
  it("lleva cada propiedad migrada a su ficha nueva", () => {
    for (const p of migrated) {
      const rule = redirects.find((r) => r.source === p.legacyPath.replace(/\/$/, ""));
      expect(rule?.destination, p.legacyPath).toBe(`/propiedades/${p.slug}`);
    }
  });

  it("no repite orígenes ni encadena redirecciones", () => {
    const sources = redirects.map((r) => r.source);
    expect(new Set(sources).size).toBe(sources.length);
    for (const r of redirects) expect(sources).not.toContain(r.destination);
  });

  it("no tapa ninguna sección del sitio nuevo", () => {
    const current = Object.values(routes).flatMap((r) => [`/${r.es}`, `/${r.en}`]);
    for (const r of redirects) {
      const first = `/${r.source.split("/")[1]}`;
      expect(current, r.source).not.toContain(first);
    }
  });

  it("usa 301 y direcciones internas", () => {
    for (const r of redirects) {
      expect(r.statusCode).toBe(301);
      expect(r.source.startsWith("/")).toBe(true);
      expect(r.source.endsWith("/")).toBe(false);
      expect(r.destination.startsWith("/")).toBe(true);
    }
  });
});
