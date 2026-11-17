import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Marca de "solo servidor": en las pruebas se usa su versión vacía.
      "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // El modo por defecto falla en la computadora del dueño (problema de la herramienta,
    // no del código); este funciona igual en todas las máquinas y en GitHub.
    pool: "vmThreads",
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
  },
});
