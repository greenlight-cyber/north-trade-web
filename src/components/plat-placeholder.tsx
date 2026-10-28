type PlatPlaceholderProps = { label: string; caption?: string };

/**
 * Lugar de la foto cuando la propiedad todavía no tiene una: una lámina de plano
 * vacía con la superficie, en vez de una imagen inventada.
 */
export function PlatPlaceholder({ label, caption }: PlatPlaceholderProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-paper-deep bg-[linear-gradient(var(--color-rule)_0.5px,transparent_0.5px),linear-gradient(90deg,var(--color-rule)_0.5px,transparent_0.5px)] bg-size-[24px_24px] p-4 text-center">
      <span className="relative font-serif text-2xl text-ink tabular-nums">{label}</span>
      {caption && <span className="relative text-xs text-line">{caption}</span>}
    </div>
  );
}
