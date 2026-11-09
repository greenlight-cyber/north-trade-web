import { Logo } from "@/components/logo";
import { MainNav } from "@/components/main-nav";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { localizePath } from "@/i18n/routes";

type SiteHeaderProps = { locale: Locale; dict: Dictionary };

export function SiteHeader({ locale, dict }: SiteHeaderProps) {
  const items = [
    { href: localizePath(locale, "properties"), label: dict.nav.properties },
    { href: localizePath(locale, "about"), label: dict.nav.about },
    { href: localizePath(locale, "contact"), label: dict.nav.contact },
  ];

  return (
    // Fijo arriba y translúcido: el contenido se ve pasar por detrás, sin perder legibilidad.
    <header className="sticky top-0 z-30 border-b border-ink/20 bg-paper/90 backdrop-blur-md supports-[not(backdrop-filter:blur(1px))]:bg-paper">
      <div className="mx-auto flex h-[4.5rem] max-w-360 items-center justify-between px-5 sm:px-8 lg:px-16">
        <Logo href={localizePath(locale, "home")} label={dict.a11y.home} />
        <MainNav
          locale={locale}
          items={items}
          labels={{
            mainNav: dict.a11y.mainNav,
            openMenu: dict.a11y.openMenu,
            closeMenu: dict.a11y.closeMenu,
            language: dict.a11y.language,
            switchLanguage: dict.a11y.switchLanguage,
          }}
        />
      </div>
    </header>
  );
}
