/** Los datos sin confirmar se guardan como "[COMPLETAR: …]" en la configuración. */
export function isPending(value: string): boolean {
  return value.startsWith("[COMPLETAR");
}

/** Muestra un dato; si está pendiente, lo marca para que se vea a simple vista. */
export function PendingValue({ value }: { value: string }) {
  if (!isPending(value)) return <>{value}</>;
  return (
    <span className="bg-paper px-1 text-seal outline-1 outline-seal outline-dashed">{value}</span>
  );
}
