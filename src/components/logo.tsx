import Image from "next/image";
import Link from "next/link";

import logo from "@/assets/brand/logotipo.png";

type LogoProps = { href: string; label: string };

/** Logo original de North Trade (PNG 350×81), mostrado a la mitad para pantallas de alta densidad. */
export function Logo({ href, label }: LogoProps) {
  return (
    <Link href={href} aria-label={label} className="inline-flex shrink-0">
      <Image
        src={logo}
        alt=""
        width={175}
        height={41}
        priority
        className="h-auto w-[150px] sm:w-[175px]"
      />
    </Link>
  );
}
