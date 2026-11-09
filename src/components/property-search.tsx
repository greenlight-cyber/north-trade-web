import { ArrowRightIcon, ChevronDownIcon } from "@/components/icons";
import { areaRanges, propertyTypes, provinces } from "@/config/catalog";
import type { ListingFilters } from "@/domain/listing";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { localizePath } from "@/i18n/routes";

type PropertySearchProps = {
  locale: Locale;
  dict: Dictionary;
  values?: ListingFilters;
  className?: string;
};

/**
 * Buscador con forma de rótulo de plano: una fila de celdas rotuladas (una debajo de
 * otra en celulares) y la acción en bordó al final. Es un formulario GET común:
 * funciona sin JavaScript.
 */
export function PropertySearch({ locale, dict, values = {}, className = "" }: PropertySearchProps) {
  const fields: { name: keyof ListingFilters; label: string; options: typeof provinces }[] = [
    { name: "provincia", label: dict.search.province, options: provinces },
    { name: "tipo", label: dict.search.type, options: propertyTypes },
    { name: "superficie", label: dict.search.area, options: areaRanges },
  ];

  return (
    <form
      action={localizePath(locale, "properties")}
      method="get"
      role="search"
      className={`grid border border-ink bg-paper md:grid-cols-[repeat(3,minmax(0,1fr))_auto] ${className}`}
    >
      <fieldset className="contents">
        <legend className="sr-only">{dict.search.legend}</legend>
        {fields.map((field) => (
          <label
            key={field.name}
            className="group relative flex flex-col justify-center border-b border-rule px-5 py-3.5 transition-colors focus-within:bg-paper-deep hover:bg-paper-deep md:border-r md:border-b-0 md:border-rule"
          >
            <span className="text-[0.6875rem] font-medium tracking-[0.16em] text-line uppercase">
              {field.label}
            </span>
            <span className="relative mt-1">
              <select
                name={field.name}
                defaultValue={values[field.name] ?? ""}
                className="plat-select w-full min-w-0 cursor-pointer bg-transparent pr-7 font-serif text-xl text-ink focus:outline-none"
              >
                <option value="">{dict.search.any}</option>
                {field.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label[locale]}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 text-line transition-transform duration-300 group-hover:translate-y-[-30%]" />
            </span>
          </label>
        ))}
      </fieldset>
      <button
        type="submit"
        className="group inline-flex min-h-16 items-center justify-center gap-3 bg-seal px-8 text-sm font-semibold tracking-[0.14em] text-paper uppercase transition-colors duration-300 hover:bg-seal-dark focus-visible:outline-offset-[-4px] focus-visible:outline-paper"
      >
        {dict.search.submit}
        <ArrowRightIcon className="transition-transform duration-300 ease-out-expo group-hover:translate-x-1.5" />
      </button>
    </form>
  );
}
