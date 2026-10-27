import { ArrowRightIcon, ChevronDownIcon } from "@/components/icons";
import { areaRanges, propertyTypes, provinces } from "@/config/catalog";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { localizePath } from "@/i18n/routes";

type PropertySearchProps = { locale: Locale; dict: Dictionary };

/**
 * Buscador con forma de cuadro de datos de plano: cada fila es una celda
 * rotulada. Es un formulario GET común: funciona sin JavaScript.
 */
export function PropertySearch({ locale, dict }: PropertySearchProps) {
  const fields = [
    { name: "provincia", label: dict.search.province, options: provinces },
    { name: "tipo", label: dict.search.type, options: propertyTypes },
    { name: "superficie", label: dict.search.area, options: areaRanges },
  ];

  return (
    <form action={localizePath(locale, "properties")} method="get" role="search">
      <fieldset className="border-t border-line">
        <legend className="sr-only">{dict.search.legend}</legend>
        {fields.map((field) => (
          <label
            key={field.name}
            className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center border-b border-line focus-within:bg-paper-deep"
          >
            <span className="py-3 text-xs font-medium tracking-[0.12em] text-line uppercase">
              {field.label}
            </span>
            <span className="relative">
              <select
                name={field.name}
                defaultValue=""
                className="w-full min-w-0 cursor-pointer appearance-none bg-transparent py-3 pr-6 text-ink focus:outline-none"
              >
                <option value="">{dict.search.any}</option>
                {field.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label[locale]}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 text-line" />
            </span>
          </label>
        ))}
      </fieldset>
      <button
        type="submit"
        className="group mt-4 inline-flex items-center gap-2 font-medium text-ink underline decoration-1 underline-offset-[0.35em] hover:text-seal"
      >
        {dict.search.submit}
        <ArrowRightIcon className="transition-transform duration-200 group-hover:translate-x-1" />
      </button>
    </form>
  );
}
