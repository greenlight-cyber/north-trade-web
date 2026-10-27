import { afterEach, describe, expect, it, vi } from "vitest";

import { getSiteUrl } from "./site-url";

describe("getSiteUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("usa la variable de entorno si es una URL válida", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    expect(getSiteUrl().origin).toBe("http://localhost:3000");
  });

  it("vuelve al dominio oficial si la variable falta", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(getSiteUrl().origin).toBe("https://www.northtrade.com.ar");
  });

  it("vuelve al dominio oficial si la variable es inválida", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "no es una url");
    expect(getSiteUrl().origin).toBe("https://www.northtrade.com.ar");
  });

  it("vuelve al dominio oficial si la variable no es http(s)", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "localhost:3000");
    expect(getSiteUrl().origin).toBe("https://www.northtrade.com.ar");
  });
});
