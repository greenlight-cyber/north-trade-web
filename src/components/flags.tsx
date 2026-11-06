import type { ComponentType, SVGProps } from "react";

import type { Locale } from "@/i18n/config";

/*
 * Banderas dibujadas en SVG: Windows no muestra los emojis de banderas (aparecen
 * como "AR" o "US"). Simplificadas para verse nítidas a 24 px de ancho.
 */

function ArgentinaFlag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 30 20" aria-hidden {...props}>
      <rect width="30" height="20" fill="#74acdf" />
      <rect y="6.67" width="30" height="6.67" fill="#fff" />
      <circle cx="15" cy="10" r="2.4" fill="#f6b40e" stroke="#85340a" strokeWidth="0.4" />
    </svg>
  );
}

function UnitedStatesFlag(props: SVGProps<SVGSVGElement>) {
  const stripes = Array.from({ length: 7 }, (_, i) => i * 2);
  return (
    <svg viewBox="0 0 30 20" aria-hidden {...props}>
      <rect width="30" height="20" fill="#fff" />
      {stripes.map((i) => (
        <rect key={i} y={(i * 20) / 13} width="30" height={20 / 13} fill="#b22234" />
      ))}
      <rect width="12" height={(7 * 20) / 13} fill="#3c3b6e" />
      {[2, 6, 10].flatMap((x) =>
        [2, 5.4, 8.8].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="0.7" fill="#fff" />),
      )}
    </svg>
  );
}

export const flags: Record<Locale, ComponentType<SVGProps<SVGSVGElement>>> = {
  es: ArgentinaFlag,
  en: UnitedStatesFlag,
};
