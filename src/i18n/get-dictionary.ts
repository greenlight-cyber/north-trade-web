import "server-only";

import type { Locale } from "./config";
import en from "./dictionaries/en";
import es from "./dictionaries/es";
import type { Dictionary } from "./dictionaries/es";

const dictionaries: Record<Locale, Dictionary> = { es, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
