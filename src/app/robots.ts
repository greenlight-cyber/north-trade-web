import type { MetadataRoute } from "next";

import { blockSearchEngines } from "@/lib/indexing";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  if (blockSearchEngines()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: new URL("/sitemap.xml", getSiteUrl()).toString(),
  };
}
