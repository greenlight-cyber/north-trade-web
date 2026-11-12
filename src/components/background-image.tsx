/** Fondos optimizados de public/fondos (los genera `npm run fondos`). */
export type Backdrop = "vinedo-uvas" | "vinedo-cerros" | "ganado" | "cultivo" | "bruma";

type BackgroundImageProps = {
  name: Backdrop;
  /** Solo el primer fondo visible de la página: se carga de inmediato y con prioridad. */
  priority?: boolean;
  className?: string;
};

const sizes = "100vw";
const srcSet = (name: Backdrop, format: "avif" | "webp") =>
  `/fondos/${name}-768.${format} 768w, /fondos/${name}-1408.${format} 1408w`;

/**
 * Imagen de fondo de sección: cubre su contenedor (que debe ser `relative`). Es decorativa,
 * sin texto alternativo; el contraste del texto lo da el velo que pone cada sección.
 */
export function BackgroundImage({ name, priority = false, className = "" }: BackgroundImageProps) {
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(name, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(name, "webp")} sizes={sizes} />
      <img
        src={`/fondos/${name}-1408.webp`}
        alt=""
        aria-hidden
        width={1408}
        height={768}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover ${className}`}
      />
    </picture>
  );
}
