import type { NextConfig } from "next";

import { legacyRedirects } from "./src/config/legacy-redirects";
import { contentSecurityPolicy, securityHeaders } from "./src/config/security-headers";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // 404 propia: el layout raíz vive bajo el segmento de idioma [lang].
  experimental: { globalNotFound: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    const csp = contentSecurityPolicy({ dev: process.env.NODE_ENV === "development" });
    return [
      { source: "/:path*", headers: [...securityHeaders] },
      // Todo menos el panel de carga.
      {
        source: "/((?!admin(?:/|$)).*)",
        headers: [{ key: "Content-Security-Policy", value: csp }],
      },
    ];
  },
  async redirects() {
    return legacyRedirects();
  },
};

export default nextConfig;
