import { describe, expect, it } from "vitest";

import { readSanityEnv } from "./env";

describe("readSanityEnv", () => {
  it("acepta un projectId válido y usa 'production' por defecto", () => {
    expect(readSanityEnv({ NEXT_PUBLIC_SANITY_PROJECT_ID: "abc123" })).toEqual({
      projectId: "abc123",
      dataset: "production",
    });
  });

  it("explica qué falta si no hay projectId", () => {
    expect(() => readSanityEnv({})).toThrow(/NEXT_PUBLIC_SANITY_PROJECT_ID/);
  });

  it("rechaza valores con caracteres inválidos", () => {
    expect(() => readSanityEnv({ NEXT_PUBLIC_SANITY_PROJECT_ID: "abc 123" })).toThrow(
      /formato inválido/,
    );
    expect(() =>
      readSanityEnv({ NEXT_PUBLIC_SANITY_PROJECT_ID: "abc", NEXT_PUBLIC_SANITY_DATASET: "Prod!" }),
    ).toThrow(/DATASET/);
  });
});
