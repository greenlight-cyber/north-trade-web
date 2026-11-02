import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getDictionary } from "@/i18n/get-dictionary";
import { getSiteUrl } from "@/lib/site-url";

import { fontVariables } from "./fonts";
import "./globals.css";

const dict = getDictionary("es");

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: dict.meta.title,
  description: dict.meta.description,
};

/** Rama de mantenimiento: una sola página, en español, sin menú ni pie. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-AR" className={`${fontVariables} antialiased`}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
