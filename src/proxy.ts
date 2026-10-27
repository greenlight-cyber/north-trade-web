import { NextResponse, type NextRequest } from "next/server";

import { resolveLocaleRoute } from "@/i18n/routes";

export function proxy(request: NextRequest) {
  const decision = resolveLocaleRoute(request.nextUrl.pathname);
  if (decision.action === "next") return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = decision.pathname;
  return decision.action === "redirect"
    ? NextResponse.redirect(url, 308)
    : NextResponse.rewrite(url);
}

export const config = {
  // Excluye archivos internos de Next, la API, el panel y todo archivo con extensión.
  matcher: ["/((?!_next/|api/|admin/|admin$|.*\\.[\\w]+$).*)"],
};
