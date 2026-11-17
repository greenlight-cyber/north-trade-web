/** Cabecera con la que Sanity firma sus webhooks: "t=<milisegundos>,v1=<firma>". */
export const signatureHeader = "sanity-webhook-signature";

/** Antigüedad máxima aceptada de una firma (la hora del envío va dentro de la firma). */
export const signatureMaxAgeMs = 5 * 60 * 1000;

const timestampPattern = /^t=(\d+)[, ]+v1=/;

/**
 * true si la firma se generó hace poco. Se usa después de verificar la firma, cuando la
 * hora ya es auténtica: así, alguien que capture un aviso no puede repetirlo más tarde.
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
