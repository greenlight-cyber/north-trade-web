import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  allowByDailyLimit,
  allowByRateLimit,
  clientIp,
  dailyLimit,
  rateLimit,
  verifyTurnstile,
} from "./services";

const upstash = { url: "https://upstash.example", token: "clave-secreta" };

/** Simula Upstash respondiendo con el valor del contador. */
const upstashReturns = (count: number) =>
  vi.fn(async () => new Response(JSON.stringify({ result: count })));

/** Comando que se le mandó a Upstash: ["EVAL", script, "1", clave, ventana]. */
const sentBody = (fetchMock: ReturnType<typeof vi.fn>): string[] => {
  const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
  return JSON.parse(String(init.body));
};

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("allowByRateLimit", () => {
  it("guarda la dirección cifrada, nunca tal cual", async () => {
    const fetchMock = upstashReturns(1);
    vi.stubGlobal("fetch", fetchMock);
    await allowByRateLimit(upstash, "200.45.10.7");
    const [, , , key, window] = sentBody(fetchMock);
    expect(key).toMatch(/^contacto:[0-9a-f]{32}$/);
    expect(JSON.stringify(sentBody(fetchMock))).not.toContain("200.45.10.7");
    expect(window).toBe(String(rateLimit.windowSeconds));
  });

  it("permite hasta el máximo y frena el siguiente", async () => {
    vi.stubGlobal("fetch", upstashReturns(rateLimit.max));
    expect(await allowByRateLimit(upstash, "1.1.1.1")).toBe(true);
    vi.stubGlobal("fetch", upstashReturns(rateLimit.max + 1));
    expect(await allowByRateLimit(upstash, "1.1.1.1")).toBe(false);
  });

  it("si Upstash no responde, deja pasar la consulta", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new Error("sin red"))),
    );
    expect(await allowByRateLimit(upstash, "1.1.1.1")).toBe(true);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("error", { status: 500 })),
    );
    expect(await allowByRateLimit(upstash, "1.1.1.1")).toBe(true);
  });
});

describe("allowByDailyLimit", () => {
  it("usa un único contador de 24 horas para todo el sitio", async () => {
    const fetchMock = upstashReturns(1);
    vi.stubGlobal("fetch", fetchMock);
    expect(await allowByDailyLimit(upstash)).toBe(true);
    const [, , , key, window] = sentBody(fetchMock);
    expect(key).toBe("contacto:total-diario");
    expect(window).toBe(String(dailyLimit.windowSeconds));
  });

  it("frena al superar el tope diario", async () => {
    vi.stubGlobal("fetch", upstashReturns(dailyLimit.max));
    expect(await allowByDailyLimit(upstash)).toBe(true);
    vi.stubGlobal("fetch", upstashReturns(dailyLimit.max + 1));
    expect(await allowByDailyLimit(upstash)).toBe(false);
  });
});

describe("verifyTurnstile", () => {
  const turnstileReturns = (body: unknown) => vi.fn(async () => new Response(JSON.stringify(body)));

  it("acepta solo un captcha aprobado para la acción del formulario", async () => {
    vi.stubGlobal("fetch", turnstileReturns({ success: true, action: "contacto" }));
    expect(await verifyTurnstile("secreto-real", "token", "1.1.1.1")).toBe(true);
    vi.stubGlobal("fetch", turnstileReturns({ success: true, action: "otra" }));
    expect(await verifyTurnstile("secreto-real", "token", "1.1.1.1")).toBe(false);
    vi.stubGlobal("fetch", turnstileReturns({ success: false }));
    expect(await verifyTurnstile("secreto-real", "token", null)).toBe(false);
  });

  it("ante una falla de red responde que no", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new Error("sin red"))),
    );
    expect(await verifyTurnstile("secreto-real", "token", null)).toBe(false);
  });
});

describe("clientIp", () => {
  it("prefiere x-real-ip y si no, la primera de x-forwarded-for", () => {
    expect(clientIp(new Headers({ "x-real-ip": "1.1.1.1", "x-forwarded-for": "2.2.2.2" }))).toBe(
      "1.1.1.1",
    );
    expect(clientIp(new Headers({ "x-forwarded-for": "2.2.2.2, 3.3.3.3" }))).toBe("2.2.2.2");
    expect(clientIp(new Headers())).toBeNull();
  });
});
