import Image from "next/image";

import logo from "@/assets/brand/logotipo.png";
import { WhatsAppIcon } from "@/components/icons";
import { CornerMarks, SurveyFrame } from "@/components/survey-frame";
import { siteConfig } from "@/config/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

/** Página de mantenimiento: se publica mientras se termina el sitio completo. */
export default function MaintenancePage() {
  return (
    <>
      <header className="border-b border-ink bg-paper">
        <div className="mx-auto flex h-[4.5rem] max-w-360 items-center justify-center px-5">
          <Image
            src={logo}
            alt={siteConfig.name}
            width={175}
            height={41}
            priority
            className="h-auto w-[150px] sm:w-[175px]"
          />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-16 sm:px-8">
        <SurveyFrame className="w-full max-w-2xl px-6 py-12 text-center sm:px-12 sm:py-16">
          <CornerMarks />
          <h1 className="font-serif text-3xl leading-snug text-balance sm:text-4xl">
            Estamos trabajando en el sitio web.
          </h1>
          <p className="mt-4 text-lg text-ink/85">
            Si tiene alguna consulta, escríbanos por WhatsApp.
          </p>
          {/* Mismo enlace y mismo aspecto que el botón flotante del sitio, pero en línea. */}
          <a
            href={buildWhatsAppUrl({ locale: "es" })}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center justify-center gap-3 border-2 border-paper bg-seal px-6 py-3.5 text-paper outline-1 outline-seal transition-colors duration-200 hover:bg-seal-dark"
          >
            <WhatsAppIcon width={24} height={24} />
            <span className="text-sm font-semibold tracking-[0.12em] uppercase">WhatsApp</span>
          </a>
        </SurveyFrame>
      </main>
    </>
  );
}
