import { z } from "zod";

/**
 * Configuración pública de Sanity (visible en el navegador, no es secreta).
 * Se valida al usarla para que un error de carga se vea claro y temprano.
 */
const publicSchema = z.object({
  projectId: z
    .string({ error: "Falta NEXT_PUBLIC_SANITY_PROJECT_ID (ver .env.example)." })
    .regex(/^[a-z0-9-]+$/, "NEXT_PUBLIC_SANITY_PROJECT_ID tiene un formato inválido."),
  dataset: z
    .string()
    .regex(/^[a-z0-9_-]+$/, "NEXT_PUBLIC_SANITY_DATASET tiene un formato inválido.")
    .default("production"),
});

export type SanityPublicEnv = z.infer<typeof publicSchema>;

export function readSanityEnv(source: Record<string, string | undefined>): SanityPublicEnv {
  const result = publicSchema.safeParse({
    projectId: source.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || undefined,
    dataset: source.NEXT_PUBLIC_SANITY_DATASET?.trim() || undefined,
  });
  if (!result.success) {
    throw new Error(result.error.issues.map((i) => i.message).join(" "));
  }
  return result.data;
}

/** Fecha de la API de Sanity que usa el sitio; fija para que no cambie solo. */
export const apiVersion = "2026-10-01";

export type SanityEnvResult = { ok: true; env: SanityPublicEnv } | { ok: false; error: string };

/** Lee la configuración sin romper el sitio si todavía no se cargó. */
export function getSanityEnv(): SanityEnvResult {
  try {
    // Next solo reemplaza las variables NEXT_PUBLIC_ cuando se escriben literalmente.
    const env = readSanityEnv({
      NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    });
    return { ok: true, env };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
