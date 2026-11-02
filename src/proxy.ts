import { NextResponse, type NextRequest } from "next/server";

/**
 * Rama de mantenimiento: toda dirección distinta de la portada vuelve a la portada.
 * La redirección es temporal (307) para que los buscadores no la guarden: cuando se
 * publique el sitio completo, las direcciones viejas tendrán sus 301 definitivas.
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/") return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Excluye archivos internos de Next y todo archivo con extensión (logo, ícono, robots.txt).
  matcher: ["/((?!_next/|.*\\.[\\w]+$).*)"],
};
