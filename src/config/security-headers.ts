/**
 * Headers de seguridad aplicados a todas las respuestas.
 *
 * La Content-Security-Policy se agrega cuando estén definidos todos los
 * orígenes externos (CMS, captcha, mapas), para no bloquear recursos legítimos.
 */
export const securityHeaders = [
  // Fuerza HTTPS durante dos años. No incluye subdominios: puede haber
  // servicios del dominio (ej. webmail) que todavía no usan HTTPS.
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  // Impide que el navegador "adivine" tipos de archivo.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Impide que otros sitios muestren esta web dentro de un iframe (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Al salir hacia otro sitio, solo se informa el dominio de origen.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Desactiva APIs del navegador que el sitio no usa.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
] as const;
