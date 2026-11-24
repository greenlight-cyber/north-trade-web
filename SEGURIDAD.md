# Seguridad y privacidad del sitio

_Última revisión: 17/11/2026_

Este documento resume cómo se protege el sitio de North Trade y los datos de quienes
escriben por el formulario. Separa lo que ya resuelve el código de lo que depende de
decisiones y cuentas de la empresa (al final, la lista de tareas).

Referencias usadas para ordenar el trabajo: Ley 25.326 de Protección de Datos Personales
y Disposición 10/2008, y como guía técnica los criterios de SOC 2 (control de acceso,
monitoreo y gestión de cambios) e ISO/IEC 27701 (privacidad). **El sitio no tiene ninguna
certificación** y no debe decir que la tiene.

## Qué datos personales maneja el sitio

| Dato                               | De dónde sale               | Adónde va                                                 | Cuánto se guarda                                 |
| ---------------------------------- | --------------------------- | --------------------------------------------------------- | ------------------------------------------------ |
| Nombre, correo, teléfono y mensaje | Formulario de contacto      | Un mail a `CONTACT_TO_EMAIL` (vía Resend)                 | Lo que defina la empresa (ver tareas)            |
| Dirección IP de la visita          | La agrega Vercel            | Cloudflare (captcha) y Upstash (solo un código seudónimo) | Upstash: 1 hora. Registros de Vercel: pocos días |
| Propiedad consultada               | La ficha desde la que llega | El mismo mail                                             | Igual que el mail                                |

- El sitio **no guarda consultas** en ninguna base de datos propia.
- No hay cookies de publicidad ni de análisis. Las fuentes se sirven desde el propio sitio.
- El mapa de Google se carga solo si la visita lo pide.
- WhatsApp y teléfono no pasan por el sitio.

## Controles implementados en el código

**Formulario de contacto** (`src/server/contact/`, `src/domain/contact.ts`)

- Todo lo que llega se valida en el servidor con esquemas estrictos (largos máximos,
  formato de correo y teléfono, idioma y propiedad solo de una lista conocida).
- Casilla de consentimiento obligatoria, validada en el servidor. El mail deja constancia
  de que se aceptó y de qué versión de la política.
- Protección contra spam, de lo más barato a lo más caro:
  1. campo trampa invisible para robots;
  2. 5 envíos por hora por conexión (se guarda un código seudónimo de la IP, calculado con clave secreta, nunca la IP);
  3. captcha de Cloudflare Turnstile, verificado en el servidor y atado a la acción `contacto`;
  4. tope de 50 mails por día (hora de Salta) para todo el sitio. Solo cuentan los mails enviados de verdad, después del captcha.
- Si Upstash no responde, el formulario sigue funcionando (el captcha sigue protegiendo).
- El mail es texto plano: lo que escribe la visita nunca se interpreta como HTML.
- Al navegador solo vuelve un código de estado; nunca detalles internos ni errores de los proveedores.
- Los registros (logs) nunca incluyen datos de la visita: solo qué paso falló.

**Contenido de Sanity** (`src/sanity/properties.ts`)

- El sitio lee con consultas que piden solo los campos públicos; las pruebas garantizan
  que nunca se piden las notas del equipo ni la dirección vieja.
- Cada ficha se valida al leerla; una mal cargada se omite sin romper la página.
- Las direcciones de las fichas se validan (solo minúsculas, números y guiones).
- Todo el texto del panel se muestra escapado (sin HTML), incluido el de los datos para Google.

**Aviso de Sanity al sitio** (`src/app/api/revalidate/route.ts`)

- Exige la firma secreta de Sanity y que tenga menos de 1 hora (no se puede repetir más tarde un aviso capturado). Una hora es lo que dura la caché, así que un reintento tardío de Sanity no hace falta.
- Lo único que puede hacer es renovar la copia en caché de las propiedades.

**Navegador y servidor** (`src/config/security-headers.ts`, `next.config.ts`)

- Cabeceras: HSTS (HTTPS obligatorio por 2 años), CSP (lista corta de orígenes permitidos),
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`,
  `Permissions-Policy` (cámara, micrófono, ubicación, pagos y USB desactivados).
- No se informa la tecnología del servidor (`X-Powered-By` desactivado).
- `src/proxy.ts` solo traduce direcciones del propio sitio: no hay redirecciones hacia afuera.
- Las versiones de prueba de Vercel no se indexan en Google.

**Secretos**

- Solo en variables de entorno; `.env*` está excluido de git y `.env.example` no tiene valores reales.
- Solo dos valores llevan el prefijo `NEXT_PUBLIC_` y son públicos por diseño: el ID del
  proyecto de Sanity y la clave de sitio de Turnstile.
- Se revisó el historial de git: no hay claves subidas.

**Gestión de cambios** (`.github/`)

- GitHub Actions verifica cada cambio: tipos, linter, formato, pruebas, dependencias
  (`npm run auditar`) y compilación de producción.
- `npm run auditar` falla con cualquier vulnerabilidad alta o crítica, salvo las aceptadas en
  `scripts/auditoria/excepciones.json`. Cada excepción dice por qué no afecta al sitio y vence
  en un mes: al vencer, la verificación vuelve a fallar y hay que revisarla.
- Dependabot propone actualizaciones de dependencias cada semana.
- Vercel instala con `npm ci` (`vercel.json`), igual que GitHub: usa exactamente las versiones
  de `package-lock.json`, sin recalcularlas. Node está fijo en la versión 22 (`engines`).

## Decisiones tomadas

- **Sanity en plan gratuito (dataset público).** Todo lo cargado en el panel se puede leer
  por la API de Sanity, incluso las notas del equipo y las propiedades vendidas. Por eso el
  campo de notas avisa que no es privado, y **nunca se cargan precios, datos del dueño ni
  datos personales** en el panel. Si algún día hace falta guardar algo confidencial ahí, hay
  que pasar a un plan pago con dataset privado.
- **CSP con `'unsafe-inline'`.** Necesario para que las páginas sigan siendo estáticas (rápidas
  en conexiones rurales). El riesgo es bajo porque el sitio no muestra HTML cargado por terceros.
- **HSTS sin subdominios.** Puede haber servicios del dominio (como el webmail) sin HTTPS.
  Se puede ampliar cuando se confirme que todos usan HTTPS.
- **El límite por conexión deja pasar si Upstash falla.** Se prefiere no perder una consulta real.
- **Repositorio público en GitHub.** El código y los textos migrados se pueden ver. No contiene
  secretos. Si se prefiere privado, se cambia en GitHub (Settings > General).

## Riesgos pendientes

- **Dependencias:**
  - `picomatch` (gravedad alta, GHSA-fc5q-39xc-vjpf): se vuelve lenta ante patrones de archivo
    armados a propósito. Solo la usan herramientas de desarrollo y compilación con patrones del
    propio proyecto; las visitas no pueden elegirlos. No hay versión corregida todavía.
    Aceptada hasta el 17/12/2026.
  - Avisos moderados en herramientas internas de Sanity (línea de comandos), que no procesan
    datos de visitas.
  - Dependabot avisará cuando haya arreglo.
- **Pull requests de Dependabot con versiones mayores** (por ejemplo TypeScript 7 o
  `@sanity/client` 8): pueden fallar la verificación porque traen cambios incompatibles. No
  unirlas sin revisar; se pueden cerrar.
- **Fichas inventadas:** una dirección con formato válido pero inexistente genera una consulta
  a Sanity. Si alguna vez hay abuso, se activa el firewall de Vercel ("Attack Challenge Mode").
- **Panel `/admin`:** la pantalla de ingreso es pública; la seguridad depende de las cuentas
  de Sanity (ver tareas).
- **Texto legal:** la política de privacidad la redactó una persona sin formación jurídica;
  tiene que revisarla un profesional antes del lanzamiento.

## Tareas para la empresa (no se resuelven con código)

**Antes del lanzamiento**

- [ ] Completar en `src/config/site.ts` los datos marcados `[COMPLETAR]`: razón social, CUIT,
      correo de contacto y plazo de conservación de las consultas (por ejemplo, 24 meses).
- [ ] Que un abogado o contador revise la política de privacidad (`/privacidad`).
- [ ] Consultar con un profesional si corresponde inscribir la base de datos en el Registro
      Nacional de Bases de Datos de la Agencia de Acceso a la Información Pública (AAIP).
- [ ] En Vercel: cargar las claves secretas solo en "Production" y activar
      "Deployment Protection" para las versiones de prueba.

**Cuentas y accesos**

- [ ] Activar la verificación en dos pasos (2FA) en GitHub, Vercel, Sanity, Resend,
      Cloudflare, Upstash y en el correo que recibe las consultas.
- [ ] Sanity: los tres integrantes con rol "Editor" (no "Administrador"); revisar cada tanto
      la lista de miembros y quitar a quien ya no trabaje en la empresa.
- [ ] Sanity: en API > CORS origins, dejar solo `https://www.northtrade.com.ar`,
      `https://north-trade-web.vercel.app` y `http://localhost:3000`.
- [ ] Sanity: confirmar que se borró la clave de escritura usada en la migración (API > Tokens).
- [ ] GitHub: proteger la rama `main` (Settings > Branches): exigir que pase la verificación
      automática antes de unir cambios.

**Consultas recibidas**

- [ ] Definir quién lee la casilla de consultas y borrar las que superen el plazo de conservación.
- [ ] En Resend, usar la retención mínima de registros de envíos.
- [ ] Si alguien pide ver, corregir o borrar sus datos: responder el acceso en 10 días corridos
      y la corrección o el borrado en 5 días hábiles (Ley 25.326, arts. 14 a 16).

**Contratos con proveedores**

- [ ] Aceptar los acuerdos de procesamiento de datos (DPA) de Vercel, Resend, Cloudflare y
      Upstash; suelen estar en la configuración de cada cuenta.

## Cómo mantenerlo

- Revisar los pull requests de Dependabot: si la verificación automática pasa, se pueden unir.
- Antes de agregar un servicio externo nuevo (scripts, mapas, analítica), sumarlo a la CSP
  (`src/config/security-headers.ts`) y a la política de privacidad.
- Si cambia el texto de la política, actualizar `privacy.updated` en `src/config/site.ts`.
