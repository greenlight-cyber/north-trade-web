import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Las versiones de prueba de Vercel no deben aparecer en Google.
  if (process.env.VERCEL_ENV === "preview") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return { rules: { userAgent: "*", allow: "/" } };
}
