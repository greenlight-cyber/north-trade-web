import { describe, expect, it } from "vitest";

import { isRecentSignature, signatureMaxAgeMs } from "./webhook-signature";

const now = Date.UTC(2026, 10, 17, 12, 0, 0);
const header = (sentAt: number) => `t=${sentAt},v1=firmaBase64`;

describe("isRecentSignature", () => {
  it("acepta una firma reciente", () => {
    expect(isRecentSignature(header(now - 2_000), now)).toBe(true);
    expect(isRecentSignature(header(now - signatureMaxAgeMs), now)).toBe(true);
  });

  it("rechaza una firma vieja (un aviso repetido más tarde)", () => {
    expect(isRecentSignature(header(now - signatureMaxAgeMs - 1), now)).toBe(false);
    expect(isRecentSignature(header(now - 24 * 60 * 60 * 1000), now)).toBe(false);
  });

  it("rechaza una firma fechada en el futuro lejano", () => {
    expect(isRecentSignature(header(now + signatureMaxAgeMs + 1), now)).toBe(false);
  });

  it("rechaza cabeceras ausentes o mal formadas", () => {
    expect(isRecentSignature(null, now)).toBe(false);
    expect(isRecentSignature("", now)).toBe(false);
    expect(isRecentSignature("v1=firma", now)).toBe(false);
    expect(isRecentSignature("t=abc,v1=firma", now)).toBe(false);
    expect(isRecentSignature(`t=${"9".repeat(30)},v1=firma`, now)).toBe(false);
  });
});
