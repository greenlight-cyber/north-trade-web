export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];

/** El español se sirve sin prefijo; el resto de los idiomas bajo /<idioma>. */
export const defaultLocale: Locale = "es";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Etiqueta BCP 47 para <html lang> y Open Graph. */
export const localeTags: Record<Locale, string> = {
  es: "es-AR",
  en: "en",
};
