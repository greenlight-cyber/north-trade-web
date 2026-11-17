/** Cabecera con la que Sanity firma sus webhooks: "t=<milisegundos>,v1=<firma>". */
export const signatureHeader = "sanity-webhook-signature";

/**
 * Antigüedad máxima aceptada de una firma. Una hora, igual que la caché de propiedades
 * (`cacheLife("hours")`): un reintento de Sanity más tardío no aporta nada, porque para
 * entonces la caché ya se renovó sola.
 */
export const signatureMaxAgeMs = 60 * 60 * 1000;

// Mismo formato que valida @sanity/webhook (SIGNATURE_HEADER_REGEX).
const timestampPattern = /^t=(\d+)[, ]+v1=/;

/**
 * true si la firma dice haberse generado hace poco. La hora va dentro de lo firmado, así
 * que, junto con la verificación de la firma, impide repetir más tarde un aviso capturado.
 * Se revisa antes que la firma porque es gratis y evita la espera de 3 s de `parseBody`.
 */
export function isRecentSignature(
  header: string | null,
  now: number,
  maxAgeMs: number = signatureMaxAgeMs,
): boolean {
  const match = header?.trim().match(timestampPattern);
  if (!match) return false;
  const sentAt = Number(match[1]);
  return Number.isSafeInteger(sentAt) && Math.abs(now - sentAt) <= maxAgeMs;
}
