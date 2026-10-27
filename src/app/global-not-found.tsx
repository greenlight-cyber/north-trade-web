import type { Metadata } from "next";
import Link from "next/link";

import { fontVariables } from "./fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "Página no encontrada · North Trade",
  robots: { index: false },
};

/**
 * 404 para direcciones que no coinciden con ninguna ruta. Se muestra fuera del
 * layout de idioma, así que ofrece ambos idiomas.
 */
export default function GlobalNotFound() {
  return (
    <html lang="es-AR" className={`${fontVariables} antialiased`}>
      <body className="flex min-h-dvh items-center justify-center px-5">
        <main className="w-full max-w-xl border border-line p-8 sm:p-12">
          <h1 className="text-4xl">Esta página no existe</h1>
          <p className="mt-4">
            Puede que la propiedad ya no esté publicada o que la dirección haya cambiado.
          </p>
          <p className="mt-2" lang="en">
            This page does not exist. The property may no longer be listed.
          </p>
          <div className="mt-8 flex flex-wrap gap-6">
            <Link href="/" className="underline hover:text-seal">
              Ir al inicio
            </Link>
            <Link href="/en" lang="en" className="underline hover:text-seal">
              Go to the English site
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
