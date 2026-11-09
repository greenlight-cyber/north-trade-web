import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";
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
  /**
   * "feature": foto alta y título grande, para la propiedad principal de la portada.
   * "side": en pantallas grandes, foto a la izquierda y datos a la derecha (más compacta).
   */
  variant?: "default" | "feature" | "side";
  sizes?: string;
};

export function PropertyCard({
  property,
  locale,
  dict,
  priority = false,
  variant = "default",
  sizes = "(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw",
}: PropertyCardProps) {
  const title = pickLocale(property.title, locale);
  const area = formatArea(property.areaHectares, locale);
  const areaText = area ? `${area.value} ${area.unit}` : null;
  const zone = pickLocale(property.zone, locale);
  const province = optionLabel(provinces, property.province, locale);
  const status = propertyStatuses.find((s) => s.value === property.status);
  const feature = variant === "feature";
  const side = variant === "side";

  return (
    <article
      className={`group relative flex h-full flex-col ${
        side ? "lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-6" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-paper-deep ${
          feature ? "aspect-4/3 lg:aspect-auto lg:min-h-96 lg:flex-1" : "aspect-4/3"
        }`}
      >
        {property.cover ? (
          <PropertyPhoto
            image={property.cover}
            locale={locale}
            fallbackAlt={title}
            sizes={sizes}
            priority={priority}
            className="transition-transform duration-1000 ease-out-expo group-hover:scale-[1.045]"
          />
        ) : (
          <PlatPlaceholder label={areaText ?? dict.listing.noPhoto} caption={zone || province} />
        )}
        {/* Velo y trazo bordó que aparecen al pasar el mouse. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/10"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-seal transition-transform duration-700 ease-out-expo group-hover:scale-x-100"
        />
        {property.status !== "disponible" && status && (
          <span className="absolute top-4 left-4 bg-paper px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.16em] text-seal uppercase">
            {status.label[locale]}
          </span>
        )}
      </div>

      <div className={feature ? "pt-5" : side ? "pt-4 lg:pt-0" : "pt-4"}>
        <p className="text-[0.6875rem] font-medium tracking-[0.16em] text-line uppercase">
          {[zone, province].filter(Boolean).join(" · ")}
        </p>
        <h3
          className={`mt-2 flex items-start justify-between gap-4 font-serif leading-tight text-balance ${
            feature ? "text-2xl lg:text-3xl" : "text-xl"
          }`}
        >
          {/* El enlace cubre toda la tarjeta, pero su nombre accesible es solo el título. */}
          <Link
            href={localizePath(locale, "properties", property.slug)}
            className="transition-colors duration-300 group-hover:text-seal after:absolute after:inset-0 focus-visible:outline-none"
          >
            {title}
          </Link>
          <ArrowRightIcon
            aria-hidden
            className="mt-1.5 shrink-0 -translate-x-2 text-seal opacity-0 transition duration-500 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100"
          />
        </h3>

        <dl className="mt-3 grid grid-cols-2 border-t border-rule pt-2.5">
          <div>
            <dt className="text-[0.6875rem] tracking-[0.16em] text-line uppercase">
              {dict.property.area}
            </dt>
            <dd className="mt-0.5 font-serif text-base tabular-nums">{areaText ?? "—"}</dd>
          </div>
          <div className="border-l border-rule pl-4">
            <dt className="text-[0.6875rem] tracking-[0.16em] text-line uppercase">
              {dict.property.type}
            </dt>
            <dd className="mt-0.5 font-serif text-base">
              {optionLabel(propertyTypes, property.propertyType, locale)}
            </dd>
          </div>
        </dl>
      </div>
      {/* El foco del enlace se marca sobre toda la tarjeta. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-2 hidden outline-2 outline-seal group-has-focus-visible:block"
      />
    </article>
  );
}
