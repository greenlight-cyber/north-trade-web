import { siteConfig } from "@/config/site";

/** URL pública del sitio. Permite usar otra en local o en previsualizaciones. */
export function getSiteUrl(): URL {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    try {
      const url = new URL(fromEnv);
      // "localhost:3000" sin esquema se interpreta como protocolo "localhost:".
      if (url.protocol === "http:" || url.protocol === "https:") return url;
    } catch {
      // Valor inválido: se usa el dominio oficial.
    }
  }
  return new URL(siteConfig.url);
}
