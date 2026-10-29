/**
 * Headers de seguridad aplicados a todas las respuestas.
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

const captcha = "https://challenges.cloudflare.com";

/**
 * Content-Security-Policy del sitio público: qué orígenes puede usar cada página.
 *
 * Sin "nonce": un nonce obliga a generar cada página en cada visita y se pierden las
 * páginas estáticas, que son las que cargan rápido con conexiones rurales. Por eso los
 * scripts propios en línea de Next se permiten con 'unsafe-inline', y el resto queda
 * limitado a una lista corta de orígenes conocidos.
 *
 * El panel /admin (Sanity Studio) no la lleva: carga recursos de muchos dominios de Sanity.
 */
export function contentSecurityPolicy({ dev }: { dev: boolean }): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // 'unsafe-eval' solo en desarrollo: React lo usa para mostrar errores.
    "script-src": ["'self'", "'unsafe-inline'", captcha, ...(dev ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'"],
    // Fotos del CDN de Sanity y las vistas previas borrosas (data:).
    "img-src": ["'self'", "data:", "blob:", "https://cdn.sanity.io"],
    "font-src": ["'self'"],
    "connect-src": ["'self'", ...(dev ? ["ws:"] : [])],
    // Captcha del formulario y mapa de la oficina.
    "frame-src": [captcha, "https://www.google.com", "https://maps.google.com"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
}
