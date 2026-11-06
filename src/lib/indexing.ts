/**
 * Las versiones de prueba de Vercel y la demo para revisión (BLOQUEAR_BUSCADORES=1)
 * no deben aparecer en Google.
 */
export function blockSearchEngines(): boolean {
  return process.env.VERCEL_ENV === "preview" || process.env.BLOQUEAR_BUSCADORES === "1";
}
