import type { NextConfig } from "next";

import { contentSecurityPolicy, securityHeaders } from "./src/config/security-headers";

// Rama de mantenimiento: sin las redirecciones 301 del sitio viejo (llevarían a páginas
// que todavía no existen) ni el panel de carga.
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  reactStrictMode: true,
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
      {
        source: "/:path*",
        headers: [...securityHeaders, { key: "Content-Security-Policy", value: csp }],
      },
    ];
  },
};

export default nextConfig;
