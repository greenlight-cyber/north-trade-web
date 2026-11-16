# Progreso — sitio de North Trade

_Última actualización: 16/11/2026_

## Terminado

- **Publicación:** el código está en GitHub (`greenlight-cyber/north-trade-web`) y Vercel publica
  cada rama. `main` está en https://north-trade-web.vercel.app y hoy tiene la versión v2.
- **Cambios pedidos por los jefes:**
  - «Tipo» pasó a llamarse «Aptitud» y se renombraron las opciones de los filtros («Mixto», «A desarrollar», etc.).
  - Se actualizó el texto de Nosotros.
  - Se agregó «Asociados a CUCIS y CAIR».
  - Se quitaron los años de trayectoria, la matrícula y el horario.
- **Encabezado:** banderas para cambiar de idioma y desplegables de filtros con estilo propio.
- **Rediseño v2 (estética editorial, misma identidad):**
  - Portada con foto grande y el buscador montado encima.
  - Selección de propiedades en composición asimétrica y pie claro.
  - Animaciones suaves.
- **Fondos de paisaje:**
  - Las imágenes están en AVIF/WebP, en dos tamaños, dentro de `public/fondos/`. Los originales quedan en `imagenes-fondo/`, fuera de git; para regenerarlas se usa `npm run fondos`.
  - Se usan en los encabezados de Propiedades, Nosotros y Contacto, y en dos secciones de la portada.
- **Últimos ajustes:**
  - Se quitaron los rótulos pequeños, salvo el de la portada, y la foto aérea repetida de Nosotros.
  - Nuevo lema del pie: «Negocios inmobiliarios en Salta, Argentina».
  - Se corrigió el margen sobre «Propiedades» en la portada.
  - El buscador tiene esquinas redondeadas.

## Decisiones

- **Contenido:** se sigue con Sanity como panel de administración, en lugar de armar uno propio.
- **Fondos:**
  - Las imágenes son generadas con IA, así que se usan solo como decoración, nunca como fotos de propiedades.
  - Se sirven ya optimizadas para no gastar la cuota de optimización de imágenes de Vercel.
- **Estilo:** el resto del sitio mantiene esquinas rectas (estilo «plano de mensura»); solo el buscador va redondeado.
- **Buscadores:** el sitio sigue oculto para Google (`BLOQUEAR_BUSCADORES=1` en Vercel) hasta el lanzamiento.
- **Ficha de propiedad:** se mantienen los títulos «Descripción», «Plano» y «Ubicación», porque ordenan el contenido de la página.

## Pendiente

- **Datos del dueño:**
  - email;
  - código postal;
  - logos de CUCIS y CAIR (confirmar si la sigla es CUCIS o CUSIS).
- **Formulario de contacto:** faltan las cuentas de Resend (email), Cloudflare Turnstile (captcha) y Upstash. Hasta que estén, se muestran WhatsApp y teléfono.
- **Traducciones al inglés** de los textos nuevos.
- **Etapa 7:** pasada de accesibilidad y rendimiento, y configurar el webhook de Sanity.
- **Lanzamiento:**
  - quitar `BLOQUEAR_BUSCADORES`;
  - dominio y DNS (los hace el dueño al final).
- **En la computadora del dueño:** las pruebas fallan con el modo habitual, por un problema de la herramienta y no del código. Con `npx vitest run --pool=vmThreads` pasan las 77. Hay que revisarlo, o fijar ese modo en `vitest.config.ts`.

## Próximo paso

Que los jefes revisen la versión publicada en `main` y, con su visto bueno, empezar la Etapa 7. En
paralelo, conseguir los datos y cuentas pendientes.
