const es = {
  meta: {
    title: "North Trade · Inmobiliaria rural en Salta",
    description:
      "Inmobiliaria rural de Salta. Compra y venta de campos en Salta, Formosa y el norte argentino, con asesoramiento integral, seriedad y absoluta reserva.",
  },
  a11y: {
    skipToContent: "Ir al contenido",
    mainNav: "Navegación principal",
    footerNav: "Navegación del pie",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    language: "Idioma",
    switchLanguage: "Read in English",
    home: "North Trade, inicio",
  },
  nav: {
    properties: "Propiedades",
    about: "Nosotros",
    contact: "Contacto",
  },
  home: {
    title: "Campos en el norte argentino",
    lead: "Somos una empresa inmobiliaria rural, con experiencia extensa en la compra y venta de campos en la provincia de Salta. Aseguramos seriedad, profesionalidad y absoluta reserva.",
    heroAlt: "Vista aérea de lotes agrícolas en Salta, separados por cortinas de monte nativo.",
    heroCaption: "Campos en Salta · vista aérea",
    highlightsTitle: "Propiedades seleccionadas",
    highlightsAll: "Ver todas las propiedades",
    aboutLink: "Sobre North Trade",
  },
  listing: {
    title: "Propiedades en venta",
    lead: "Campos, fincas y terrenos en Salta y el norte argentino. Los precios se informan por consulta.",
    count: (n: number) => (n === 1 ? "1 propiedad" : `${n} propiedades`),
    clearFilters: "Quitar filtros",
    emptyTitle: "No hay propiedades con esos filtros",
    emptyText: "Probá con otros filtros o consultanos por WhatsApp por otros perfiles de campos.",
    loading: "Cargando propiedades…",
    noPhoto: "Sin foto",
  },
  property: {
    price: "Precio",
    priceValue: "Consultar",
    area: "Superficie",
    type: "Aptitud",
    province: "Provincia",
    zone: "Zona",
    status: "Estado",
    facts: "Datos de la propiedad",
    location: "Ubicación aproximada",
    locationNote: "Por reserva, la ubicación exacta se informa al consultar.",
    description: "Descripción",
    plan: "Plano o imagen satelital",
    photos: "Fotos",
    photoOf: (i: number, n: number) => `Foto ${i} de ${n}`,
    noPhotos: "Esta propiedad todavía no tiene fotos publicadas.",
    back: "Todas las propiedades",
    enquire: "Consultar por esta propiedad",
    sold: "Esta propiedad ya fue vendida.",
    soldCta: "Ver propiedades disponibles",
    translationNote: "",
  },
  search: {
    legend: "Buscar propiedades",
    province: "Provincia",
    type: "Aptitud",
    area: "Superficie",
    any: "Todas",
    submit: "Ver propiedades",
  },
  contact: {
    whatsappCta: "Consultar por WhatsApp",
    callCta: "Llamar",
    writeCta: "Escribir un mensaje",
    floating: "Escribinos por WhatsApp",
  },
  about: {
    metaDescription:
      "North Trade es una empresa inmobiliaria rural de Salta, con experiencia extensa en la compra y venta de campos. Seriedad, profesionalidad y absoluta reserva.",
    title: "Nosotros",
    lead: "Somos una empresa inmobiliaria rural, con experiencia extensa en la compra y venta de campos en la provincia de Salta. Aseguramos seriedad, profesionalidad y absoluta reserva.",
    body: "Contamos con la estructura y logística necesaria para brindar un asesoramiento integral del negocio inmobiliario.",
    servicesTitle: "Servicios",
    services: [
      {
        title: "Propiedades rurales",
        text: "Campos agrícolas, ganaderos y mixtos, fincas y fracciones en venta en la provincia de Salta.",
      },
      {
        title: "Propiedades urbanas",
        text: "Terrenos y propiedades urbanas seleccionadas en dos zonas:",
        areas: ["Salta", "Cafayate"],
      },
      {
        title: "Asesoramiento integral",
        text: "Acompañamiento en todo el negocio inmobiliario, con la estructura y la logística necesarias.",
      },
    ],
    firmTitle: "La firma",
    region: "Zona de trabajo",
    regionValue: "Salta, Argentina",
    ctaTitle: "¿Buscás un campo?",
    ctaText: "Contanos qué estás buscando: zona, superficie y destino.",
  },
  contactPage: {
    metaDescription:
      "Contacto de North Trade, inmobiliaria rural en Salta: WhatsApp, teléfono, oficina en Toribio Tedín 77 y formulario de consulta.",
    title: "Contacto",
    directTitle: "Contacto directo",
    formTitle: "Dejanos un mensaje",
    officeTitle: "Oficina",
    mapTitle: "Mapa: oficina de North Trade en Salta",
    mapShow: "Mostrar mapa",
    mapOpen: "Abrir en Google Maps",
    mapNote: "El mapa se carga desde Google solo si lo pedís.",
  },
  form: {
    name: "Nombre y apellido",
    email: "Correo electrónico",
    phone: "Teléfono",
    optional: "opcional",
    message: "Mensaje",
    messageHint: "Contanos qué tipo de campo buscás: zona, superficie y destino.",
    propertyLabel: "Consulta por",
    captcha: "Verificación anti-spam",
    privacy:
      "Responsable: North Trade. Usamos tus datos solo para responder esta consulta y podés pedir acceso, corrección o borrado en cualquier momento.",
    consentBefore: "Leí la",
    consentLink: "política de privacidad",
    consentAfter:
      "y acepto que North Trade use mis datos para responder esta consulta, también con proveedores fuera de Argentina.",
    legalNotices: [
      "El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley N° 25.326.",
      "La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.",
    ],
    submit: "Enviar mensaje",
    sending: "Enviando…",
    errors: {
      required: "Completá este campo.",
      tooShort: "Es demasiado corto.",
      tooLong: "Es demasiado largo.",
      invalidEmail: "Revisá el correo: parece incompleto.",
      invalidPhone: "Usá solo números, espacios, guiones y el signo +.",
      consentRequired: "Para enviar el mensaje, marcá la casilla de privacidad.",
    },
    status: {
      success: "Gracias. Recibimos tu mensaje y te vamos a responder por correo o por teléfono.",
      invalid: "Revisá los campos marcados.",
      captcha:
        "No pudimos completar la verificación anti-spam. Esperá unos segundos y volvé a intentar.",
      rateLimited:
        "Recibimos varios mensajes seguidos desde tu conexión. Probá más tarde o escribinos por WhatsApp.",
      unavailable:
        "El formulario no está disponible en este momento. Escribinos por WhatsApp o llamanos.",
      error: "No pudimos enviar el mensaje. Probá de nuevo o escribinos por WhatsApp.",
    },
  },
  footer: {
    tagline: "Negocios inmobiliarios en Salta, Argentina.",
    titleBlock: "Datos de la firma",
    address: "Domicilio",
    phone: "Teléfono",
    whatsapp: "WhatsApp",
    email: "Correo",
    associations: "Asociados a",
    rights: "Todos los derechos reservados.",
    privacy: "Política de privacidad",
  },
  privacyPage: {
    title: "Política de privacidad",
    metaDescription:
      "Qué datos personales recibe North Trade a través de su sitio web, para qué los usa, cuánto tiempo los guarda y cómo pedir acceso, corrección o borrado.",
    lead: "Qué datos recibimos a través de este sitio, para qué los usamos y cómo podés pedir que los corrijamos o borremos.",
    updated: "Última actualización",
    responsibleTitle: "Responsable de los datos",
    responsible: "Responsable",
    taxId: "CUIT",
    address: "Domicilio",
    email: "Correo",
    sections: [
      {
        title: "Qué datos recibimos",
        paragraphs: [
          "Solo los que escribís en el formulario de contacto: nombre y apellido, correo electrónico, teléfono (si lo indicás), tu mensaje y, si corresponde, la propiedad por la que consultás.",
          "Para frenar envíos automáticos también se usa la dirección IP de tu conexión: el servicio anti-spam la verifica y el contador de envíos guarda solo una versión cifrada durante una hora.",
          "Si nos escribís por WhatsApp o nos llamás, esa conversación no pasa por este sitio.",
        ],
      },
      {
        title: "Para qué los usamos",
        paragraphs: [
          "Únicamente para responder tu consulta y seguir la conversación sobre las propiedades que te interesan.",
          "No los usamos para publicidad, no te sumamos a listas de correo y no los vendemos ni los cedemos a terceros.",
        ],
      },
      {
        title: "Quién más interviene",
        paragraphs: [
          "Para que el sitio funcione usamos estos proveedores, que tratan los datos solo por cuenta nuestra:",
        ],
        items: [
          "Vercel, que aloja el sitio (Estados Unidos).",
          "Resend, que entrega por correo tu consulta (Estados Unidos).",
          "Cloudflare Turnstile, que hace la verificación anti-spam.",
          "Upstash, que lleva el contador de envíos contra el spam.",
        ],
        after:
          "Algunos de estos proveedores están fuera de Argentina. Al marcar la casilla del formulario aceptás esa transferencia, que se hace solo para responder tu consulta.",
      },
    ],
    retentionTitle: "Cuánto tiempo los guardamos",
    retentionBefore: "Guardamos las consultas recibidas durante",
    retentionAfter:
      "y después las borramos. El contador anti-spam se borra solo, una hora después del envío.",
    rightsTitle: "Tus derechos",
    rights: [
      "Podés pedir gratis acceso a tus datos y que los corrijamos, actualicemos o borremos. Escribinos al correo indicado arriba o acercate a la oficina.",
      "Respondemos los pedidos de acceso dentro de los 10 días corridos, y los de corrección o borrado dentro de los 5 días hábiles.",
    ],
    cookiesTitle: "Cookies",
    cookies: [
      "Este sitio no usa cookies de publicidad ni de análisis de visitas.",
      "El captcha de Cloudflare puede leer datos técnicos del navegador solo para distinguir personas de robots. El mapa de Google se carga solo si lo pedís, y en ese caso se aplican las reglas de Google.",
    ],
    changesTitle: "Cambios en esta política",
    changes: "Si cambiamos esta política, la fecha de actualización de esta página lo indica.",
    legalTitle: "Información legal",
    authorityLink: "Agencia de Acceso a la Información Pública",
  },
};

export default es;
export type Dictionary = typeof es;
