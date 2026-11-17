import { encodeSignatureHeader } from "@sanity/webhook";
import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.hoisted(() => vi.fn());
vi.mock("next/cache", () => ({ revalidateTag }));
vi.mock("@/sanity/properties", () => ({ propertiesTag: "properties" }));

import { POST } from "./route";

const secret = "frase-secreta-de-prueba";
const now = Date.UTC(2026, 10, 17, 12, 0, 0);

async function signedRequest(body: unknown, { sentAt = now, key = secret } = {}) {
  const payload = JSON.stringify(body);
  const signature = await encodeSignatureHeader(payload, sentAt, key);
  return new Request("https://sitio.example/api/revalidate", {
    method: "POST",
    headers: { "sanity-webhook-signature": signature, "content-type": "application/json" },
    body: payload,
  }) as unknown as NextRequest;
}

/** El webhook espera 3 s a que Sanity termine de guardar: se adelanta el reloj simulado. */
async function call(request: NextRequest) {
  let done = false;
  const pending = POST(request).finally(() => {
    done = true;
  });
  // La verificación de la firma termina fuera de la cola de microtareas: se avanza el
  // reloj de a poco, dejando correr el resto, hasta que llega la respuesta.
  while (!done) {
    await new Promise((resolve) => setImmediate(resolve));
    await vi.advanceTimersByTimeAsync(500);
  }
  return pending;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "Date"] });
  vi.setSystemTime(now);
  vi.stubEnv("SANITY_REVALIDATE_SECRET", secret);
  vi.spyOn(console, "error").mockImplementation(() => {});
  revalidateTag.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("webhook de Sanity", () => {
  it("con una firma válida y reciente, actualiza las propiedades", async () => {
    const response = await call(await signedRequest({ _type: "property" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, revalidated: true });
    expect(revalidateTag).toHaveBeenCalledWith("properties", { expire: 0 });
  });

  it("ignora avisos de otros tipos de documento", async () => {
    const response = await call(await signedRequest({ _type: "otro" }));
    expect(await response.json()).toEqual({ ok: true, revalidated: false });
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rechaza una firma con otra clave", async () => {
    const response = await call(await signedRequest({ _type: "property" }, { key: "otra" }));
    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rechaza un aviso auténtico pero viejo (repetido)", async () => {
    const sentAt = now - 60 * 60 * 1000;
    const response = await call(await signedRequest({ _type: "property" }, { sentAt }));
    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rechaza un pedido sin firma", async () => {
    const request = new Request("https://sitio.example/api/revalidate", {
      method: "POST",
      body: JSON.stringify({ _type: "property" }),
    }) as unknown as NextRequest;
    const response = await call(request);
    expect(response.status).toBe(401);
  });

  it("sin la clave configurada responde error sin procesar nada", async () => {
    vi.stubEnv("SANITY_REVALIDATE_SECRET", "");
    const response = await call(await signedRequest({ _type: "property" }));
    expect(response.status).toBe(500);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
