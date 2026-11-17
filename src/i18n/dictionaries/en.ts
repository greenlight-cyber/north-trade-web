import type { Dictionary } from "./es";

const en: Dictionary = {
  meta: {
    title: "North Trade · Rural real estate in Salta, Argentina",
    description:
      "Rural real estate firm based in Salta. Farmland and ranches for sale in Salta, Formosa and northern Argentina, with full advisory, professionalism and absolute discretion.",
  },
  a11y: {
    skipToContent: "Skip to content",
    mainNav: "Main navigation",
    footerNav: "Footer navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
    switchLanguage: "Leer en español",
    home: "North Trade, home",
  },
  nav: {
    properties: "Properties",
    about: "About",
    contact: "Contact",
  },
  home: {
    title: "Farmland in northern Argentina",
    lead: "We are a rural real estate firm with extensive experience buying and selling farmland in the province of Salta. We guarantee professionalism, reliability and absolute discretion.",
    heroAlt: "Aerial view of farm plots in Salta, divided by strips of native forest.",
    heroCaption: "Farmland in Salta · aerial view",
    highlightsTitle: "Selected properties",
    highlightsAll: "View all properties",
    aboutLink: "About North Trade",
  },
  listing: {
    title: "Properties for sale",
    lead: "Farmland, estates and plots in Salta and northern Argentina. Prices on request.",
    count: (n: number) => (n === 1 ? "1 property" : `${n} properties`),
    clearFilters: "Clear filters",
    emptyTitle: "No properties match these filters",
    emptyText: "Try other filters, or ask us on WhatsApp about other kinds of farmland.",
    loading: "Loading properties…",
    noPhoto: "No photo",
  },
  property: {
    price: "Price",
    priceValue: "On request",
    area: "Area",
    type: "Land use",
    province: "Province",
    zone: "District",
    status: "Status",
    facts: "Property details",
    location: "Approximate location",
    locationNote: "For confidentiality, the exact location is shared on enquiry.",
    description: "Description",
    plan: "Plan or satellite image",
    photos: "Photos",
    photoOf: (i: number, n: number) => `Photo ${i} of ${n}`,
    noPhotos: "This property has no published photos yet.",
    back: "All properties",
    enquire: "Ask about this property",
    sold: "This property has been sold.",
    soldCta: "See available properties",
    translationNote: "The full description is currently available in Spanish only.",
  },
  search: {
    legend: "Search properties",
    province: "Province",
    type: "Land use",
    area: "Area",
    any: "Any",
    submit: "View properties",
  },
  contact: {
    whatsappCta: "Enquire on WhatsApp",
    callCta: "Call",
    writeCta: "Send a message",
    floating: "Message us on WhatsApp",
  },
  about: {
    metaDescription:
      "North Trade is a rural real estate firm in Salta, Argentina, with extensive experience in buying and selling farmland. Seriousness, professionalism and complete discretion.",
    title: "About us",
    lead: "We are a rural real estate firm with extensive experience in buying and selling farmland in the province of Salta. We guarantee seriousness, professionalism and complete discretion.",
    body: "We have the structure and logistics needed to provide comprehensive advice throughout the real estate transaction.",
    servicesTitle: "Services",
    services: [
      {
        title: "Rural properties",
        text: "Cropland, cattle and mixed farms, estates and rural plots for sale in the province of Salta.",
      },
      {
        title: "Urban properties",
        text: "Selected plots and urban properties in two areas:",
        areas: ["Salta", "Cafayate"],
      },
      {
        title: "Comprehensive advice",
        text: "Support throughout the real estate transaction, with the structure and logistics it requires.",
      },
    ],
    firmTitle: "The firm",
    region: "Region",
    regionValue: "Salta, Argentina",
    ctaTitle: "Looking for farmland?",
    ctaText: "Tell us what you are looking for: region, size and intended use.",
  },
  contactPage: {
    metaDescription:
      "Contact North Trade, rural real estate in Salta, Argentina: WhatsApp, phone, office at Toribio Tedín 77 and enquiry form.",
    title: "Contact",
    directTitle: "Direct contact",
    formTitle: "Leave us a message",
    officeTitle: "Office",
    mapTitle: "Map: North Trade office in Salta",
    mapShow: "Show map",
    mapOpen: "Open in Google Maps",
    mapNote: "The map loads from Google only if you ask for it.",
  },
  form: {
    name: "Full name",
    email: "Email",
    phone: "Phone",
    optional: "optional",
    message: "Message",
    messageHint: "Tell us what kind of land you are looking for: region, size and intended use.",
    propertyLabel: "Enquiry about",
    captcha: "Spam check",
    privacy:
      "Data controller: North Trade. We only use your details to reply to this enquiry, and you can ask us to access, correct or delete them at any time.",
    consentBefore: "I have read the",
    consentLink: "privacy policy",
    consentAfter:
      "and agree that North Trade may use my details to reply to this enquiry, including through service providers outside Argentina.",
    legalNotices: [
      "The data subject has the right to access their personal data free of charge at intervals of no less than six months, unless a legitimate interest is shown, as set forth in Article 14, paragraph 3 of Argentine Law No. 25,326.",
      "The Agency for Access to Public Information (AAIP), as the supervisory authority of Law No. 25,326, is empowered to handle complaints and claims filed by anyone whose rights are affected by a breach of the rules on personal data protection.",
    ],
    submit: "Send message",
    sending: "Sending…",
    errors: {
      required: "Please fill in this field.",
      tooShort: "This is too short.",
      tooLong: "This is too long.",
      invalidEmail: "Please check the email address.",
      invalidPhone: "Use only numbers, spaces, hyphens and the + sign.",
      consentRequired: "To send your message, please tick the privacy box.",
    },
    status: {
      success: "Thank you. We received your message and will reply by email or phone.",
      invalid: "Please check the highlighted fields.",
      captcha: "We could not complete the spam check. Please wait a few seconds and try again.",
      rateLimited:
        "We received several messages in a row from your connection. Please try later or message us on WhatsApp.",
      unavailable:
        "The form is not available right now. Please message us on WhatsApp or give us a call.",
      error: "We could not send your message. Please try again or message us on WhatsApp.",
    },
  },
  footer: {
    tagline: "Real estate in Salta, Argentina.",
    titleBlock: "Firm details",
    address: "Office",
    phone: "Phone",
    whatsapp: "WhatsApp",
    email: "Email",
    associations: "Member of",
    rights: "All rights reserved.",
    privacy: "Privacy policy",
  },
  privacyPage: {
    title: "Privacy policy",
    metaDescription:
      "What personal data North Trade receives through its website, what it is used for, how long it is kept and how to ask for access, correction or deletion.",
    lead: "What data we receive through this website, what we use it for and how you can ask us to correct or delete it.",
    updated: "Last updated",
    responsibleTitle: "Data controller",
    responsible: "Controller",
    taxId: "Tax ID (CUIT)",
    address: "Office",
    email: "Email",
    sections: [
      {
        title: "What data we receive",
        paragraphs: [
          "Only what you type into the contact form: your full name, email address, phone number (if you give one), your message and, where relevant, the property you are asking about.",
          "To stop automated submissions, your connection's IP address is also used: the spam check verifies it, and the submission counter keeps, for one hour, only a pseudonymous code derived from it, never the address itself.",
          "If you message us on WhatsApp or call us, that conversation does not go through this website.",
        ],
      },
      {
        title: "What we use it for",
        paragraphs: [
          "Only to reply to your enquiry and continue the conversation about the properties you are interested in.",
          "We do not use it for advertising, we do not add you to mailing lists and we do not sell or share it with third parties.",
        ],
      },
      {
        title: "Who else is involved",
        paragraphs: [
          "The website relies on these service providers, which process data only on our behalf:",
        ],
        items: [
          "Vercel, which hosts the website (United States).",
          "Resend, which delivers your enquiry by email (United States).",
          "Cloudflare Turnstile, which runs the spam check.",
          "Upstash, which keeps the anti-spam submission counter.",
        ],
        after:
          "Some of these providers are outside Argentina. By ticking the box on the form you agree to that transfer, which is made only to reply to your enquiry.",
      },
    ],
    retentionTitle: "How long we keep it",
    retentionBefore: "We keep the enquiries we receive for",
    retentionAfter:
      "and then delete them. The anti-spam counter deletes itself one hour after you submit.",
    rightsTitle: "Your rights",
    rights: [
      "You can ask, free of charge, to access your data and to have it corrected, updated or deleted. Email us at the address above or visit our office.",
      "We answer access requests within 10 calendar days, and correction or deletion requests within 5 business days.",
    ],
    cookiesTitle: "Cookies",
    cookies: [
      "This website does not use advertising or analytics cookies.",
      "Cloudflare's spam check may read technical browser data only to tell people from bots. The Google map loads only if you ask for it, and Google's terms then apply.",
    ],
    changesTitle: "Changes to this policy",
    changes: "If we change this policy, the date on this page will show it.",
    legalTitle: "Legal information",
    authorityLink: "Agency for Access to Public Information (AAIP)",
  },
};

export default en;
