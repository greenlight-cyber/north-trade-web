import type { ReactNode } from "react";

type SurveyFrameProps = { children: ReactNode; className?: string };

/**
 * Marco de línea fina de agrimensor. Las cuatro líneas se trazan al cargar
 * (salvo con "reducir movimiento"); el contenido es visible desde el inicio.
 */
export function SurveyFrame({ children, className = "" }: SurveyFrameProps) {
  return (
    <div className={`relative ${className}`}>
      <span aria-hidden className="survey-trace absolute inset-x-0 top-0 h-px bg-line" />
      <span
        aria-hidden
        className="survey-trace-y absolute inset-y-0 right-0 w-px bg-line [animation-delay:150ms]"
      />
      <span
        aria-hidden
        className="survey-trace absolute inset-x-0 bottom-0 h-px bg-line [animation-delay:300ms]"
      />
      <span
        aria-hidden
        className="survey-trace-y absolute inset-y-0 left-0 w-px bg-line [animation-delay:450ms]"
      />
      {children}
    </div>
  );
}

/** Marcas de esquina de registro, como en las láminas de un plano. */
export function CornerMarks() {
  const mark = "absolute h-4 w-4 border-ink";
  return (
    <>
      <span aria-hidden className={`${mark} -top-2 -left-2 border-t border-l`} />
      <span aria-hidden className={`${mark} -top-2 -right-2 border-t border-r`} />
      <span aria-hidden className={`${mark} -bottom-2 -left-2 border-b border-l`} />
      <span aria-hidden className={`${mark} -right-2 -bottom-2 border-r border-b`} />
    </>
  );
}
