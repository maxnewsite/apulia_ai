// NewsMediaOrganization — the schema.org subtype Google recognizes for
// editorial publishers. Carries E-E-A-T signals (publishing principles,
// ethics policy, corrections policy) plus a citation graph of monitored
// sources for borrowed authority.
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
  sameAs: [
    'https://twitter.com/apuliaai',
    'https://www.linkedin.com/company/apulia-ai',
  ],
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
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://apulia.ai/?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://apulia.ai/#faq',
  inLanguage: 'it-IT',
  mainEntity: [
    {
      '@type': 'Question',
      name: "Cos'è apulia.ai?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "apulia.ai è la newsletter italiana specializzata in intelligenza artificiale europea: una pubblicazione indipendente che esce ogni domenica pomeriggio (AI Europa Weekly, gratuita) per arrivare nella tua inbox prima del lunedì mattina, e ogni primo lunedì del mese (Briefing Strategico Mensile, premium). Copre EU AI Act, startup AI italiane ed europee, investimenti VC e pubblici, ricerca accademica, infrastrutture compute e politiche industriali nei 9 principali paesi EU più il Regno Unito.",
      },
    },
    {
      '@type': 'Question',
      name: "Cos'è l'EU AI Act e cosa cambia per le aziende italiane?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "L'EU AI Act (Regolamento UE 2024/1689) è il primo quadro normativo globale sull'intelligenza artificiale, entrato in vigore il 1° agosto 2024. Per le aziende italiane le scadenze chiave sono: febbraio 2025 (divieto sistemi AI inaccettabili — social scoring, manipolazione cognitiva), agosto 2025 (obblighi per modelli AI general-purpose, GPAI), agosto 2026 (conformità completa per sistemi ad alto rischio in HR, credito, sanità e infrastrutture critiche). Le sanzioni arrivano fino a €35 milioni o il 7% del fatturato globale.",
      },
    },
    {
      '@type': 'Question',
      name: 'La newsletter AI Europa Weekly è gratuita?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Sì, AI Europa Weekly è completamente gratuita e lo rimarrà. Esce ogni domenica pomeriggio (orario CET) e arriva nella tua inbox in tempo per il lunedì mattina, con 8 sviluppi chiave della settimana, radar normativo EU AI Act, focus sull'ecosistema AI italiano, briefing per paese (Francia, Germania, Spagna, UK e altri), aggiornamenti su funding e startup europee. Iscrizione con sola email, nessuna carta di credito.",
      },
    },
    {
      '@type': 'Question',
      name: "Quando entra in vigore l'AI Act in Italia? Quali sono le scadenze?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "L'EU AI Act si applica in Italia secondo questo calendario: 2 febbraio 2025 — vietati i sistemi AI a rischio inaccettabile (social scoring, biometria in tempo reale in spazi pubblici, manipolazione subliminale). 2 agosto 2025 — requisiti per modelli AI general-purpose (GPAI) e modelli con impatto sistemico (>10²⁵ FLOPs di addestramento). 2 agosto 2026 — obblighi completi per sistemi ad alto rischio: selezione del personale, scoring creditizio, sistemi biometrici, istruzione, sanità, infrastrutture critiche. 2 agosto 2027 — adeguamento dei sistemi già in commercio prima di agosto 2026.",
      },
    },
    {
      '@type': 'Question',
      name: 'Quali startup AI italiane sono più rilevanti nel 2025–2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Le startup AI italiane più rilevanti includono: Musixmatch (Milano, NLP per lyrics e metadata musicali, 100M+ utenti), Translated (Roma, piattaforma traduzione AI e dati per LLM), Datrix (Milano, AI predittiva e NLP enterprise), Spindox (AI consulting per PA e banche), TeaStore (AI per retail e supply chain). Sul fronte corporate, Leonardo, Fincantieri, Intesa Sanpaolo e Generali investono centinaia di milioni in AI. La Fondazione FAIR finanziata dal PNRR con €114M coordina la ricerca AI nazionale.",
      },
    },
    {
      '@type': 'Question',
      name: "Quanto investe l'Europa in intelligenza artificiale?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Nel 2024 gli investimenti in AI in Europa hanno superato €22 miliardi (+67% crescita startup AI UE rispetto al 2023). Per paese: Francia >€6 miliardi (piano IA Macron), Germania >€5 miliardi (Zukunftsstrategie KI), UK >£2,5 miliardi (AI Opportunities Action Plan), Italia ~€3,5 miliardi (PNRR + privati). L'infrastruttura compute europea include i supercomputer EuroHPC: Leonardo a Bologna (4° al mondo per potenza), LUMI in Finlandia e Marenostrum 5 in Spagna.",
      },
    },
    {
      '@type': 'Question',
      name: "Cos'è il Briefing Strategico Mensile di apulia.ai?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Il Briefing Strategico Mensile è la pubblicazione premium di apulia.ai: un report di 8–12 pagine in PDF pubblicato ogni primo lunedì del mese. Include executive summary bilingue (italiano e inglese), analisi strategica mensile con fatto/contesto/implicazione, radar normativo approfondito, briefing per i 9 paesi EU principali più UK, analisi dei round di finanziamento e M&A, Company Watch (5 aziende da monitorare con motivazione strategica), matrice capacità AI per paese e settore, e outlook a 12 mesi.",
      },
    },
    {
      '@type': 'Question',
      name: "Come mi iscrivo alla newsletter sull'AI europea?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "L'iscrizione è gratuita e richiede meno di 30 secondi: inserisci la tua email nel form in fondo alla pagina, scegli se ricevere solo la AI Europa Weekly (gratuita, ogni domenica pomeriggio) o anche il Briefing Strategico Mensile (premium), accetta la privacy policy GDPR e clicca Iscriviti. Riceverai una email di conferma entro pochi minuti. Puoi disdire in qualsiasi momento con un click, senza preavviso.",
      },
    },
    {
      '@type': 'Question',
      name: 'Quali sono i principali modelli AI europei alternativi a ChatGPT?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "I principali modelli AI fondazionali europei sono: Mistral AI (Francia) con Mistral 7B, Mixtral 8x7B e Mistral Large — open-weight, disponibili su Hugging Face; Aleph Alpha (Germania) con Luminous, focalizzato su sovranità digitale e uso nella PA europea; Silo AI (Finlandia, acquisita da AMD) con modelli multilingue europei; LightOn (Francia) per AI enterprise. La Commissione Europea finanzia lo sviluppo di modelli AI europei attraverso il programma AI Factories nell'ambito di EuroHPC.",
      },
    },
    {
      '@type': 'Question',
      name: 'Come viene prodotta la newsletter? È curata da redattori o generata da AI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "La newsletter usa un sistema editoriale ibrido: raccolta automatica da oltre 30 fonti primarie (Wired Italia, Il Sole 24 Ore Tecnologia, AgendaDigitale, Sifted, Tech.eu, POLITICO Tech, MIT Technology Review e altri), classificazione e prioritizzazione con modelli AI, redazione e verifica finale da parte del team editoriale umano. Ogni notizia cita le fonti originali. Non pubblichiamo contenuti generati interamente da AI senza revisione umana.",
      },
    },
  ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}
