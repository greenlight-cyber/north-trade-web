import Image from "next/image";
import { notFound } from "next/navigation";

import aerialPhoto from "@/assets/home/campos-salta-aerea.jpg";
import { PhoneIcon } from "@/components/icons";
import { PropertySearch } from "@/components/property-search";
import { CornerMarks, SurveyFrame } from "@/components/survey-frame";
import { WhatsAppSeal } from "@/components/whatsapp-seal";
import { siteConfig } from "@/config/site";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <section className="mx-auto grid max-w-360 grid-cols-1 gap-10 px-5 pt-8 pb-16 sm:px-8 lg:h-[clamp(40rem,calc(100dvh-4.5rem),58rem)] lg:grid-cols-[minmax(0,1.62fr)_minmax(24rem,1fr)] lg:gap-14 lg:px-16 lg:pt-12">
      <figure className="relative m-2 min-h-[18rem] lg:m-0 lg:min-h-0">
        <CornerMarks />
        <Image
          src={aerialPhoto}
          alt={dict.home.heroAlt}
          fill
          priority
          placeholder="blur"
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
        />
        <figcaption className="absolute bottom-4 left-4 border border-line bg-paper px-3 py-1.5 text-sm text-ink">
          {dict.home.heroCaption}
        </figcaption>
      </figure>

      <SurveyFrame className="flex flex-col p-6 sm:p-8 lg:p-10">
        <h1 className="text-display">{dict.home.title}</h1>
        <p className="mt-5 max-w-[46ch] text-ink/85">{dict.home.lead}</p>

        <div className="mt-8">
          <PropertySearch locale={lang} dict={dict} />
        </div>

        <div className="mt-auto flex flex-col gap-4 pt-10">
          <WhatsAppSeal locale={lang} label={dict.contact.whatsappCta} />
          <a
            href={`tel:${siteConfig.contact.phone.e164}`}
            className="inline-flex items-center justify-center gap-2 text-sm text-line hover:text-ink"
          >
            <PhoneIcon width={16} height={16} />
            {dict.contact.callCta} {siteConfig.contact.phone.display}
          </a>
        </div>
      </SurveyFrame>
    </section>
  );
}
