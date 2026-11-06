"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { flags } from "@/components/flags";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { languageNames, locales, type Locale } from "@/i18n/config";
import { switchLocalePath, toPublicPath } from "@/i18n/routes";

export type NavItem = { href: string; label: string };

type MainNavProps = {
  locale: Locale;
  items: NavItem[];
  labels: {
    mainNav: string;
    openMenu: string;
    closeMenu: string;
    language: string;
    switchLanguage: string;
  };
};

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav({ locale, items, labels }: MainNavProps) {
  // El proxy reescribe las direcciones: se normaliza a la forma pública que usan los enlaces.
  const pathname = toPublicPath(usePathname());
  const router = useRouter();
  // El menú móvil queda abierto solo en la página donde se abrió: al navegar, se cierra.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);
  const panelId = useId();
  const otherLocale: Locale = locale === "es" ? "en" : "es";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const languageHref = switchLocalePath(pathname, otherLocale);
  const flagBox = "inline-flex h-9 w-11 items-center justify-center border";
  const flag = (l: Locale) => {
    const Flag = flags[l];
    return <Flag width={24} height={16} className="outline-1 outline-rule" />;
  };
  // Las dos banderas, en el mismo orden en ambos idiomas: la actual queda marcada.
  const languageSwitch = (
    <div role="group" aria-label={labels.language} className="flex items-center gap-1.5">
      {locales.map((l) =>
        l === locale ? (
          <span
            key={l}
            aria-current="true"
            title={languageNames[l]}
            className={`${flagBox} border-seal`}
          >
            {flag(l)}
            <span className="sr-only" lang={l}>
              {languageNames[l]}
            </span>
          </span>
        ) : (
          <Link
            key={l}
            href={languageHref}
            // Conserva los filtros de búsqueda al cambiar de idioma. Se lee al hacer clic para no
            // depender de useSearchParams, que obligaría a demorar el armado del encabezado.
            onClick={(e) => {
              const query = window.location.search;
              if (!query || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
                return;
              e.preventDefault();
              router.push(languageHref + query);
            }}
            hrefLang={l}
            lang={l}
            aria-label={labels.switchLanguage}
            title={languageNames[l]}
            className={`${flagBox} border-transparent opacity-80 transition hover:border-line hover:opacity-100`}
          >
            {flag(l)}
          </Link>
        ),
      )}
    </div>
  );
  return (
    <nav aria-label={labels.mainNav} className="flex items-center gap-6">
      <ul className="hidden items-center gap-8 md:flex">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`text-[0.95rem] transition-colors ${
                  active
                    ? "text-seal underline decoration-1 underline-offset-[0.45em]"
                    : "text-ink hover:text-seal"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {languageSwitch}

      <button
        type="button"
        className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-ink md:hidden"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? labels.closeMenu : labels.openMenu}
        onClick={() => setOpen(!open)}
      >
        {open ? <CloseIcon width={24} height={24} /> : <MenuIcon width={24} height={24} />}
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full z-40 border-b border-ink bg-paper md:hidden"
      >
        <ul className="px-5 py-2">
          {items.map((item) => (
            <li key={item.href} className="border-b border-rule last:border-b-0">
              <Link
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                onClick={() => setOpenOn(null)}
                className="block py-4 font-serif text-2xl aria-[current=page]:text-seal"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
