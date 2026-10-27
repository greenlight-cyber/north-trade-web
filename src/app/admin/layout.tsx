import type { ReactNode } from "react";

import { localeTags } from "@/i18n/config";

export { metadata, viewport } from "next-sanity/studio";

/** Layout raíz propio del panel: no comparte encabezado ni estilos con el sitio. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={localeTags.es}>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
