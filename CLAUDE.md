# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Website for North Trade, a rural real estate firm in Salta, Argentina (replaces the old WordPress site at www.northtrade.com.ar). Product context, audience and hard content rules are in `PRODUCT.md`; read it before changing copy or pages.

**Read `AGENTS.md` first:** this is Next.js 16 with breaking changes. Check `node_modules/next/dist/docs/` before using any Next API.

## Working with the owner

- The owner is not a programmer and speaks Spanish: explain results in simple Spanish.
- Work is done in numbered stages ("Etapa N"). Each stage ends with:
  1. build and tests pass;
  2. the `code-review` skill is run and its fixes applied;
  3. a commit (message in Spanish, `Etapa N: …`);
  4. a short Spanish explanation of what changed and how to see it locally.
- **Never invent data:** no testimonials, figures, years in business or client logos. Missing facts stay as visible `[COMPLETAR: …]` markers.
  - In `src/config/site.ts`, `PendingValue` renders those markers highlighted.
  - Tell the owner whenever you add a new one.
- Prices are never published (always "Consultar"/"On request"), and sold properties are not listed. The site targets buyers only.
- Secrets live only in env vars, documented in `.env.example`.
- Do not touch the domain or DNS.

## Commands

```bash
npm run dev            # http://localhost:3000
npm run build          # production build (cacheComponents/PPR: catches Suspense/params mistakes)
npm run check          # typecheck + lint + prettier check + tests
npm run typecheck      # next typegen && tsc --noEmit (typegen is needed for PageProps of new routes)
npm test               # vitest run
npx vitest run src/domain/listing.test.ts      # one file
npx vitest run -t "filtra por rango"           # one test by name
npm run format         # prettier --write (with tailwind class sorting)
npm run migrar         # one-off WordPress→Sanity import (dry run; add -- --confirmar to write)
```

On the owner's machine, builds and first-time dev page compiles are very slow. A build can take tens of minutes, so run builds in the background. To check pages, prefer `next start -p 3001` on a finished build over the dev server. The owner usually has their own dev server on port 3000; don't kill it.

## Architecture

**Routing and i18n.**

- All pages live under `src/app/[lang]/` and use Spanish folder names (`propiedades`, `nosotros`, `contacto`).
- Public URLs are localized:
  - Spanish has no prefix (`/propiedades`).
  - English uses `/en/properties`, `/en/about`, `/en/contact`.
- `src/proxy.ts` (Next 16's middleware) calls `resolveLocaleRoute` in `src/i18n/routes.ts`. It rewrites public URLs to the internal `[lang]` paths and redirects non-canonical ones (`/es/...`, `/en/propiedades`).
- Always build links with `localizePath(locale, routeKey, slug?)`.
- `usePathname()` returns the _rewritten_ internal path; convert it with `toPublicPath` or `switchLocalePath`.
- The proxy matcher skips any path containing a dot, so slugs must never contain dots.

**Dictionaries.**

- UI text lives in `src/i18n/dictionaries/{es,en}.ts`; `en` is typed against `es`.
- Some entries are functions (e.g. `listing.count`), so don't pass the whole dictionary to a client component; pass a plain sub-object such as `dict.form`.
- Spanish copy currently uses voseo ("Consultanos", "podés").
- Property descriptions are often Spanish-only. The English page then shows a translation note and marks the text `lang="es"`.

**Cache Components (`cacheComponents: true`, `partialPrefetching: true` in next.config.ts).**

- Any read of `searchParams`, `params` (in dynamic routes) or request data must sit inside `<Suspense>`. See `propiedades/page.tsx`, `[slug]/page.tsx` and `contacto/page.tsx`.
- `generateStaticParams` must return at least one entry. `[slug]` falls back to the placeholder slug `sin-propiedades`.
- `notFound()` inside Suspense streams a 404 page with `noindex` but an HTTP 200 status.
- `[lang]/not-found.tsx` is the in-site 404. `src/app/global-not-found.tsx` covers unmatched URLs.
- `/admin` has its own root layout (Sanity Studio via next-sanity) and shares nothing with the site.

**Content (Sanity).**

- Schemas are in `src/sanity/schemas/`. `property.ts` holds Spanish editor labels, a custom `slugify`, and an `internalNotes` field that must never reach the site.
- `src/sanity/properties.ts` (server-only) is the only read path. It runs GROQ queries that project public fields only, wrapped in `"use cache"` + `cacheTag("properties")` + `cacheLife("hours")`.
- Results are validated with Zod; invalid documents are dropped with a warning rather than breaking pages.
- Each function returns empty or null when the Sanity env is missing.
- `src/app/api/revalidate/route.ts` is a signed Sanity webhook that expires the `properties` tag.
- Images are served from Sanity's CDN through a custom `next/image` loader (`sanity-image.tsx`, client component).
- Properties without photos render `PlatPlaceholder`, never a stock image.

**Domain logic.**

- `src/domain/` contains pure, unit-tested modules: listing filters and sort, property formatting, contact validation.
- Filters come from URL search params; only values known in `src/config/catalog.ts` are accepted.

**Contact form.**

- Server Action in `src/server/contact/actions.ts`. It delegates to `handleContact` (`handle-contact.ts`), which takes injected dependencies so tests use fakes.
- Order of checks: honeypot (fake success) → Zod validation → captcha token present → Upstash rate limit (5/hour, HMAC-hashed IP) → Cloudflare Turnstile verification → Resend email (plain text, `reply_to` set to the visitor).
- Only a status code plus the visitor's own values go back to the client. Messages are translated client-side from `dict.form`.
- If any env var checked by `getContactConfig()` is missing, the page shows WhatsApp/phone instead of the form.
- External services are called with plain `fetch` (no SDKs), with timeouts.

**Floating WhatsApp button.**

- The layout renders a generic button.
- Pages that provide their own WhatsApp access carry a `data-wa-local` element: the property page has its own floating button that names the property, and the contact page has the large button. On those pages, CSS (`body:has(...)`) hides the generic button.
- WhatsApp links are built by `buildWhatsAppUrl` in `src/lib/whatsapp.ts`.

**Migration.**

- `scripts/migracion/` contains `propiedades.json`, the 51 curated properties recovered from the Wayback Machine.
- The import script (`importar.mts`) is idempotent and refuses to run twice (it writes a `migrationRun` marker document).
- Each property's `legacyPath` will drive the 301 redirects.

## Visual system

- The design concept is a "survey plat" (plano de mensura).
- Tokens are in `src/app/globals.css` under `@theme`: paper, ink, line, rule, `seal` (brand burgundy `#8C1A1C`). Serif headings, 1px rules, no shadows and no rounded corners.
- The burgundy seal is the only accent, used for actions and status.
- Design notes live in `.impeccable/` and `PRODUCT.md`.
- A broader visual redesign is planned after v1. Keep components simple so they can be restyled.

**SEO.** Every page builds its metadata with `pageMetadata` (`src/lib/seo.ts`): canonical, hreflang alternates and a complete `openGraph` block (Next replaces rather than merges a layout's `openGraph`). JSON-LD (`src/lib/structured-data.ts`) never publishes `[COMPLETAR]` values or prices. Old WordPress URLs are 301-redirected via `src/config/legacy-redirects.ts`, which `next.config.ts` imports, so that file uses relative imports only. The CSP (`src/config/security-headers.ts`) uses no nonce, to keep pages static, and doesn't apply to `/admin`. Any new external origin (scripts, iframes, images) must be added there.

## Pending stages

- **Etapa 7:** accessibility and performance pass, Vercel preview deploy, Sanity webhook setup.
- **Redesign:** after v1, the owner will provide a reference site for a more modern look.
