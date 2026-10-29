import { serializeJsonLd } from "@/lib/structured-data";

/** Datos estructurados para buscadores; no se ven en la página. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
