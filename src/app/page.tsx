import { siteConfig } from "@/config/site";

// Página provisoria: se reemplaza en la etapa de Inicio.
export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-4 px-6 py-24">
      <h1 className="text-4xl">{siteConfig.name}</h1>
      <p>{siteConfig.tagline}</p>
      <p>{siteConfig.contact.address.display}</p>
    </main>
  );
}
