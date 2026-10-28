import Link from "next/link";

import { PlatPlaceholder } from "@/components/plat-placeholder";
import { PropertyPhoto } from "@/components/property-photo";
import { optionLabel, propertyTypes, provinces } from "@/config/catalog";
import type { PropertySummary } from "@/domain/listing";
import { formatArea, pickLocale, propertyStatuses } from "@/domain/property";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { localizePath } from "@/i18n/routes";

type PropertyCardProps = {
  property: PropertySummary;
  locale: Locale;
  dict: Dictionary;
  priority?: boolean;
};

export function PropertyCard({ property, locale, dict, priority = false }: PropertyCardProps) {
  const title = pickLocale(property.title, locale);
  const area = formatArea(property.areaHectares, locale);
  const areaText = area ? `${area.value} ${area.unit}` : null;
  const zone = pickLocale(property.zone, locale);
  const province = optionLabel(provinces, property.province, locale);
  const status = propertyStatuses.find((s) => s.value === property.status);

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-4/3 overflow-hidden border border-line bg-paper-deep">
        {property.cover ? (
          <PropertyPhoto
            image={property.cover}
            locale={locale}
            fallbackAlt={title}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            priority={priority}
            className="transition-transform duration-500 ease-out-expo group-hover:scale-[1.02]"
          />
        ) : (
          <PlatPlaceholder label={areaText ?? dict.listing.noPhoto} caption={zone || province} />
        )}
        {property.status !== "disponible" && status && (
          <span className="absolute top-3 left-3 border border-seal bg-paper px-2 py-1 text-xs font-semibold tracking-[0.12em] text-seal uppercase">
            {status.label[locale]}
          </span>
        )}
      </div>

      <h3 className="mt-4 font-serif text-xl leading-snug text-balance">
        {/* El enlace cubre toda la tarjeta, pero su nombre accesible es solo el título. */}
        <Link
          href={localizePath(locale, "properties", property.slug)}
          className="group-hover:text-seal after:absolute after:inset-0 focus-visible:outline-none"
        >
          {title}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-line">{[zone, province].filter(Boolean).join(" · ")}</p>

      <dl className="mt-3 grid grid-cols-2 border-t border-rule pt-3 text-sm">
        <div>
          <dt className="sr-only">{dict.property.area}</dt>
          <dd className="font-medium tabular-nums">{areaText ?? "—"}</dd>
        </div>
        <div className="text-right">
          <dt className="sr-only">{dict.property.type}</dt>
          <dd className="text-line">{optionLabel(propertyTypes, property.propertyType, locale)}</dd>
        </div>
      </dl>
      {/* El foco del enlace se marca sobre toda la tarjeta. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-2 hidden outline-2 outline-seal group-has-[:focus-visible]:block"
      />
    </article>
  );
}
