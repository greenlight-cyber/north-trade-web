import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  allowByDailyLimit,
  allowByRateLimit,
  clientIp,
  dailyKey,
  dailyLimit,
  rateLimit,
  recordDailySend,
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

describe("tope diario", () => {
  // 01:30 del 17/11/2026 en Salta (UTC−3).
  const now = new Date("2026-11-17T04:30:00Z");

  it("usa un contador por día calendario de Salta", () => {
    expect(dailyKey(now)).toBe("contacto:total:2026-11-17");
    // 23:30 del 16 en Salta, aunque en UTC ya sea el 17.
    expect(dailyKey(new Date("2026-11-17T02:30:00Z"))).toBe("contacto:total:2026-11-16");
  });

  it("solo lee el contador al consultar, sin sumar", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ result: null })));
    vi.stubGlobal("fetch", fetchMock);
    expect(await allowByDailyLimit(upstash, now)).toBe(true);
    expect(sentBody(fetchMock)).toEqual(["GET", "contacto:total:2026-11-17"]);
  });

  it("frena cuando ya se enviaron los del día", async () => {
    const returns = (value: string) =>
      vi.fn(async () => new Response(JSON.stringify({ result: value })));
    vi.stubGlobal("fetch", returns(String(dailyLimit.max - 1)));
    expect(await allowByDailyLimit(upstash, now)).toBe(true);
    vi.stubGlobal("fetch", returns(String(dailyLimit.max)));
    expect(await allowByDailyLimit(upstash, now)).toBe(false);
  });

  it("anota cada envío con vencimiento, y si Upstash falla no rompe nada", async () => {
    const fetchMock = upstashReturns(1);
    vi.stubGlobal("fetch", fetchMock);
    await recordDailySend(upstash, now);
    const [command, , , key, seconds] = sentBody(fetchMock);
    expect([command, key, seconds]).toEqual(["EVAL", "contacto:total:2026-11-17", "172800"]);

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new Error("sin red"))),
    );
    await expect(recordDailySend(upstash, now)).resolves.toBeUndefined();
    expect(await allowByDailyLimit(upstash, now)).toBe(true);
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
