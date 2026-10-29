"use client";

import { useState } from "react";

type OfficeMapProps = {
  /** Dirección tal como la busca Google Maps. */
  query: string;
  labels: { title: string; show: string; open: string; note: string };
};

/**
 * Mapa de Google que se carga recién cuando la visita lo pide: pesa más de 1 MB
 * y en conexiones rurales lentas demoraría toda la página.
 */
export function OfficeMap({ query, labels }: OfficeMapProps) {
  const [visible, setVisible] = useState(false);
  const q = encodeURIComponent(query);

  return (
    <div>
      <div className="relative aspect-4/3 border border-line bg-paper-deep">
        {visible ? (
          <iframe
            title={labels.title}
            src={`https://www.google.com/maps?q=${q}&output=embed`}
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[linear-gradient(var(--color-rule)_0.5px,transparent_0.5px),linear-gradient(90deg,var(--color-rule)_0.5px,transparent_0.5px)] bg-size-[24px_24px] p-6 text-center">
            <button
              type="button"
              onClick={() => setVisible(true)}
              className="border-2 border-ink bg-paper px-5 py-2.5 text-sm font-semibold tracking-[0.12em] uppercase hover:border-seal hover:text-seal"
            >
              {labels.show}
            </button>
            <p className="max-w-xs bg-paper px-2 text-sm text-line">{labels.note}</p>
          </div>
        )}
      </div>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${q}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-sm underline hover:text-seal"
      >
        {labels.open}
      </a>
    </div>
  );
}
