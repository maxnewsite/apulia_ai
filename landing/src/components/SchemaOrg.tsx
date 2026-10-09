// NewsMediaOrganization — the schema.org subtype Google recognizes for
// editorial publishers. Carries E-E-A-T signals (publishing principles,
// ethics policy, corrections policy) plus a citation graph of monitored
// sources for borrowed authority.
import { founderRef } from '@/lib/seo-entities'
import { translations } from '@/lib/i18n'

const newsOrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  '@id': 'https://apulia.ai/#organization',
  name: 'apulia.ai',
  legalName: 'apulia.ai',
  url: 'https://apulia.ai',
  logo: {
    '@type': 'ImageObject',
    url: 'https://apulia.ai/apulia_ai.webp',
    width: 512,
    height: 512,
  },
  image: 'https://apulia.ai/apulia_ai.webp',
  description:
    "Newsletter editoriale italiana indipendente specializzata in intelligenza artificiale europea. Pubblica AI Europa Weekly (settimanale, gratuita) e Briefing Strategico Mensile (premium).",
  foundingDate: '2026',
  founder: founderRef,
  foundingLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IT',
      addressRegion: 'Puglia',
    },
  },
  knowsAbout: [
    'Intelligenza Artificiale',
    'EU AI Act',
    'Regolamento UE 2024/1689',
    'Startup AI',
    'Investimenti Venture Capital AI',
    'Modelli AI Fondazionali',
    'Compute e Infrastrutture AI',
    'Policy digitale europea',
    'PNRR Digitale',
    'GDPR e AI',
  ],
  publishingPrinciples: 'https://apulia.ai/privacy',
  ethicsPolicy: 'https://apulia.ai/privacy',
  correctionsPolicy: 'https://apulia.ai/privacy',
  diversityPolicy: 'https://apulia.ai/privacy',
  masthead: 'https://apulia.ai/',
  // Il profilo X va aggiunto qui quando esiste davvero: un sameAs che dà 404
  // indebolisce l'entità invece di rafforzarla (vedi claudedocs/seo-roadmap.md).
  sameAs: ['https://www.linkedin.com/company/apulia-ai'],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'newsletter@apulia.ai',
    contactType: 'editorial',
    availableLanguage: ['Italian', 'English'],
  },
  // Citation graph — borrowed authority from monitored primary sources
  citation: [
    { '@type': 'NewsMediaOrganization', name: 'MIT Technology Review', url: 'https://www.technologyreview.com/' },
    { '@type': 'NewsMediaOrganization', name: 'POLITICO Europe', url: 'https://www.politico.eu/' },
    { '@type': 'NewsMediaOrganization', name: 'Reuters', url: 'https://www.reuters.com/' },
    { '@type': 'NewsMediaOrganization', name: 'Bloomberg', url: 'https://www.bloomberg.com/' },
    { '@type': 'NewsMediaOrganization', name: 'Financial Times', url: 'https://www.ft.com/' },
    { '@type': 'NewsMediaOrganization', name: 'WIRED Italia', url: 'https://www.wired.it/' },
    { '@type': 'NewsMediaOrganization', name: 'Il Sole 24 Ore', url: 'https://www.ilsole24ore.com/' },
    { '@type': 'NewsMediaOrganization', name: 'Sifted', url: 'https://sifted.eu/' },
    { '@type': 'NewsMediaOrganization', name: 'Tech.eu', url: 'https://tech.eu/' },
    { '@type': 'NewsMediaOrganization', name: 'Agenda Digitale', url: 'https://www.agendadigitale.eu/' },
    { '@type': 'NewsMediaOrganization', name: 'VentureBeat', url: 'https://venturebeat.com/' },
    { '@type': 'NewsMediaOrganization', name: 'StartupItalia', url: 'https://startupitalia.eu/' },
  ],
  // The publications produced by apulia.ai
  publishingPrinciplesPublication: 'https://apulia.ai',
  brand: {
    '@type': 'Brand',
    name: 'apulia.ai',
    logo: 'https://apulia.ai/apulia_ai.webp',
  },
}

// Periodical publications (Weekly + Monthly) — schema.org/Periodical
// signals to Google News and search that apulia.ai is a serial publication
const weeklyPublicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Periodical',
  '@id': 'https://apulia.ai/#weekly',
  name: 'AI Europa Weekly',
  alternateName: 'AI Europa Weekly Newsletter',
  url: 'https://apulia.ai',
  publisher: { '@id': 'https://apulia.ai/#organization' },
  inLanguage: ['it', 'en'],
  about: ['Intelligenza Artificiale', 'EU AI Act', 'Startup AI Europa'],
  description:
    'Newsletter settimanale gratuita pubblicata ogni domenica pomeriggio (CET) per arrivare nella inbox dei lettori prima del lunedì mattina: 8 sviluppi chiave sull\'intelligenza artificiale in Europa — EU AI Act, startup, finanziamenti, ricerca, infrastrutture.',
  audience: {
    '@type': 'Audience',
    audienceType: 'AI professionals, decision-makers, policy makers, investors',
    geographicArea: { '@type': 'Place', name: 'Europe' },
  },
}

const monthlyPublicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Periodical',
  '@id': 'https://apulia.ai/#monthly',
  name: 'Briefing Strategico Mensile',
  alternateName: 'Monthly Strategic Briefing',
  url: 'https://apulia.ai',
  publisher: { '@id': 'https://apulia.ai/#organization' },
  inLanguage: ['it', 'en'],
  about: ['Intelligenza Artificiale strategica', 'Investimenti AI Europa', 'Policy AI'],
  description:
    'Report premium di 8–12 pagine pubblicato ogni primo lunedì del mese: analisi strategica AI europea, radar normativo, briefing per paese, M&A, Company Watch e outlook 12 mesi.',
  audience: {
    '@type': 'Audience',
    audienceType: 'C-level executives, VC investors, strategy consultants',
    geographicArea: { '@type': 'Place', name: 'Europe' },
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://apulia.ai/#website',
  name: 'apulia.ai',
  url: 'https://apulia.ai',
  inLanguage: ['it-IT', 'en-GB'],
  publisher: { '@id': 'https://apulia.ai/#organization' },
}

// Solo in home: lo schema FAQ deve corrispondere a domande visibili nella
// pagina, e le FAQ sono renderizzate solo lì. Generato dagli stessi testi
// della sezione FAQ (italiano, lingua di default) per restare allineato.
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://apulia.ai/#faq',
  inLanguage: 'it-IT',
  mainEntity: translations.it.faq.items.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

export default function SchemaOrg() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsOrganizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(weeklyPublicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(monthlyPublicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  )
}
