export type Language = 'it' | 'en'

export const translations = {
  it: {
    // Nav
    nav: {
      newsletter: 'Newsletter',
      analysis: 'Analisi',
      about: 'Chi siamo',
      langToggle: 'EN',
    },
    // Hero
    hero: {
      tagline: 'L\'AI in Europa. Ogni settimana.',
      headline: 'L\'intelligenza artificiale ridisegna le regole dell\'economia europea.',
      headlineHighlight: 'Capire prima. Decidere meglio.',
      subtitle:
        'Ogni domenica pomeriggio: normativa AI Act, movimenti di capitale nel venture europeo e ricerca applicata analizzati per le loro implicazioni strategiche su imprese, investitori e policy maker. Copertura esclusiva di 10 paesi EU con fonti verificate in 5 lingue.',
      cta: 'Iscriviti gratis',
      ctaSubtext: 'Nessun spam.',
    },
    // Stats
    stats: [
      { value: '€22 miliardi', label: 'investiti in AI in Europa nel 2024' },
      { value: 'AI Act', label: '1ª regolamentazione AI al mondo, in vigore 2024' },
      { value: '+67%', label: 'crescita startup AI nell\'UE 2023–2024' },
      { value: '€1.2 miliardi', label: 'PNRR italiano per digitale e AI' },
    ],
    // Products
    products: {
      sectionTitle: 'Due prodotti, una missione',
      sectionSubtitle: 'Informazione di qualità sull\'AI europea, al livello di profondità che preferisci.',
      weekly: {
        badge: 'Gratuito',
        name: 'AI Europa Weekly',
        frequency: 'Ogni domenica pomeriggio',
        description:
          'La newsletter settimanale che monitora per te l\'ecosistema AI europeo: regolamentazione, startup, ricerca e politica industriale. Pronta in inbox per il lunedì mattina.',
        features: [
          '8 fatti chiave per il lunedì mattina',
          'Aggiornamenti EU AI Act e normative',
          'Movimenti startup e round di finanziamento',
          'Segnalazioni di ricerca e innovazione',
          'Link selezionati e curati a mano',
        ],
        cta: 'Iscriviti gratis',
        price: 'Sempre gratuita',
      },
      monthly: {
        badge: 'Premium',
        name: 'Briefing Strategico Mensile',
        frequency: 'Ogni primo lunedì del mese',
        description:
          'L\'analisi approfondita per chi deve prendere decisioni strategiche sull\'AI in Europa. Dati, trend e opportunità in 8–12 pagine dense.',
        features: [
          'Report 8–12 pagine in PDF e web',
          'Mappa delle opportunità di mercato',
          'Radar investimenti e M&A europei',
          'Analisi comparative per paese/settore',
          'Interviste a founder e decision-maker',
          'Accesso archivio completo',
        ],
        cta: 'Accedi al briefing',
        price: 'A breve disponibile',
        priceNote: 'Lista d\'attesa aperta',
      },
      apulia: {
        badge: 'Su misura',
        name: 'AI Applicata',
        frequency: 'Programma per la tua azienda',
        description:
          'Sistemi di AI che leggono il tuo mercato, si collegano ai tuoi dati e indicano al tuo team cosa fare. Decisioni concrete, non dashboard.',
        features: [
          'Intelligence di settore industrializzata',
          'Collegata ai tuoi sistemi operativi',
          'Mappatura di dati e processi interni',
          'Workflow automatizzati per l\'azione',
          'Raccomandazioni firmabili dalla leadership',
          'Prezzo legato al risultato',
        ],
        cta: 'Parliamone',
        price: 'Su richiesta',
        priceNote: 'Programma pilota in lancio',
      },
    },
    // Subscribe form
    form: {
      sectionTitle: 'Inizia oggi',
      sectionSubtitle: 'Unisciti a chi in Italia e in Europa tiene il polso sull\'AI.',
      emailPlaceholder: 'La tua email',
      emailLabel: 'Indirizzo email',
      productLabel: 'Cosa vuoi ricevere?',
      products: {
        weekly: 'AI Europa Weekly (gratuita)',
        monthly: 'Briefing Strategico (premium)',
        both: 'Entrambi',
      },
      gdpr: 'Accetto la ',
      gdprLink: 'Privacy Policy',
      gdprSuffix: ' e il trattamento dei dati per l\'invio della newsletter.',
      submit: 'Iscriviti',
      submitting: 'Iscrizione in corso...',
      successTitle: 'Iscrizione completata!',
      successMessage:
        'Controlla la tua email per confermare l\'iscrizione. A presto nella tua inbox.',
      errorGeneric: 'Qualcosa è andato storto. Riprova tra qualche secondo.',
      errorEmail: 'Inserisci un indirizzo email valido.',
      errorGdpr: 'Devi accettare la Privacy Policy per iscriverti.',
    },
    // Social proof
    audience: {
      sectionTitle: 'Pensato per chi decide',
      sectionSubtitle:
        'Da startup founder a policy maker, apulia.ai è il punto di riferimento per chi lavora o investe nell\'AI in Italia e in Europa.',
      personas: [
        {
          role: 'CTO / CIO',
          icon: '💻',
          description:
            'Monitora l\'evoluzione tecnologica e normativa per guidare le scelte infrastrutturali della tua azienda.',
        },
        {
          role: 'Investitori VC',
          icon: '📈',
          description:
            'Identifica le startup AI europee più promettenti prima che diventino mainstream, con dati e analisi settoriali.',
        },
        {
          role: 'Startup Founder',
          icon: '🚀',
          description:
            'Naviga l\'AI Act, individua fondi e grant europei, e scopri opportunità di partnership nel mercato UE.',
        },
        {
          role: 'Policy Maker',
          icon: '🏛️',
          description:
            'Comprendi l\'impatto delle normative AI sull\'economia italiana, con confronti europei e benchmark internazionali.',
        },
        {
          role: 'Consulenti Strategici',
          icon: '🎯',
          description:
            'Porta ai clienti analisi aggiornate sull\'AI europea: mercato, rischi regolatori e opportunità competitive.',
        },
      ],
    },
    // Preview
    preview: {
      sectionTitle: 'Un assaggio del contenuto',
      badge: 'Edizione del 20 maggio 2026',
      headline: '5 fatti sull\'AI europea questa settimana',
      items: [
        {
          number: '01',
          title: 'L\'UE approva i primi codici di condotta per i modelli general-purpose',
          abstract:
            'La Commissione europea ha pubblicato le linee guida operative per i provider di modelli GPAI sopra la soglia di 10²⁵ FLOP. Google, Meta e Mistral sono i primi firmatari.',
        },
        {
          number: '02',
          title: 'Italia: €340M dal PNRR per centri di calcolo AI nel Sud',
          abstract:
            'Il Ministero delle Imprese conferma il finanziamento per tre data center ad alta efficienza energetica in Puglia, Calabria e Sicilia, con focus su training di modelli domain-specific.',
        },
        {
          number: '03',
          title: 'Mistral AI raccoglie €600M: valutazione a €6 miliardi',
          abstract:
            'Il nuovo round guidato da General Catalyst consolida Mistral come principale alternativa europea a OpenAI. Prevista apertura uffici a Milano entro Q4 2026.',
        },
      ],
      cta: 'Leggi l\'edizione completa',
    },
    // How It Works
    howItWorks: {
      sectionTitle: 'Come funziona',
      sectionSubtitle: "Tre passi per arrivare al lunedì mattina pronto sull'AI europea.",
      steps: [
        {
          number: '01',
          title: 'Ti iscrivi',
          description: 'Inserisci la tua email. Nessuna carta di credito, nessun paywall. Solo AI signal.',
        },
        {
          number: '02',
          title: 'Ogni domenica pomeriggio',
          description: "Ricevi 8 fatti essenziali sull'AI europea, curati dalla redazione di apulia.ai. Pronto per il lunedì.",
        },
        {
          number: '03',
          title: 'Inizi la settimana avanti',
          description: "Policy, startup, investimenti: il lunedì mattina sai già cosa è successo e perché conta.",
        },
      ],
    },
    // FAQ
    faq: {
      sectionTitle: 'Domande frequenti',
      sectionSubtitle: "AI Act, investimenti, AI in Italia e come funziona apulia.ai.",
      items: [
        {
          q: "Cos'è apulia.ai e chi c'è dietro?",
          a: "apulia.ai è una pubblicazione indipendente sull'intelligenza artificiale in Europa e in Italia, pensata per chi prende decisioni in azienda. Ogni settimana pubblica AI Europa Weekly: gli sviluppi che contano su normativa, investimenti, infrastrutture e mercato italiano, con le fonti originali. È fondata da Massimiliano Masi, ex Partner di Boston Consulting Group, che firma ogni edizione.",
          link: { href: '/chi-siamo', label: 'Il team di apulia.ai' },
        },
        {
          q: "Quali sono le scadenze dell'AI Act dopo il Digital Omnibus?",
          a: "L'AI Act (Regolamento UE 2024/1689) è in vigore dal 1° agosto 2024. I divieti sulle pratiche inaccettabili si applicano dal 2 febbraio 2025 e le regole sui modelli di AI per uso generale dal 2 agosto 2025. Il Digital Omnibus (Regolamento UE 2026/1744, in vigore dal 27 luglio 2026) ha rinviato gli obblighi per i sistemi ad alto rischio: al 2 dicembre 2027 per quelli dell'Allegato III (es. selezione del personale, credito, biometria) e al 2 agosto 2028 per l'AI integrata in prodotti regolati dell'Allegato I, come i dispositivi medici.",
          link: { href: '/temi/ai-act', label: "Tutte le novità sull'AI Act" },
        },
        {
          q: "Cosa prevede la legge italiana sull'intelligenza artificiale?",
          a: "Con la legge 132/2025, approvata a settembre 2025, l'Italia è stata il primo Stato UE a dotarsi di una legge organica sull'AI. Il 10 giugno 2026 il Consiglio dei ministri ha approvato i due decreti attuativi: affidano la vigilanza ad ACN (Agenzia per la cybersicurezza nazionale) e AgID, introducono un reato per l'omissione delle misure di sicurezza nei sistemi ad alto rischio e una presunzione del nesso causale per i danni causati dall'AI. Completano l'AI Act senza sostituirlo.",
          link: { href: '/temi/ai-italia', label: "Le notizie sull'AI in Italia" },
        },
        {
          q: "Quali sanzioni prevede l'AI Act per le aziende?",
          a: "Le sanzioni dell'AI Act arrivano fino a 35 milioni di euro o al 7% del fatturato mondiale annuo per l'uso di pratiche vietate, fino a 15 milioni o al 3% per la violazione degli altri obblighi, e fino a 7,5 milioni o all'1% per informazioni inesatte fornite alle autorità. Per le PMI e le startup si applica l'importo più basso tra la cifra fissa e la percentuale.",
          link: { href: '/temi/ai-act', label: "Aggiornamenti su AI Act e normativa" },
        },
        {
          q: "Dove trovo i round di finanziamento e gli investimenti nell'AI in Europa?",
          a: "Ogni edizione di AI Europa Weekly ha una sezione Funding & Mercati con round, acquisizioni e grandi investimenti in Europa e in Italia. Li raccogliamo tutti, dal più recente, in una pagina dedicata, aggiornata ogni settimana con il link alla fonte di ogni notizia.",
          link: { href: '/temi/investimenti-ai', label: 'Investimenti e round AI' },
        },
        {
          q: "Come posso seguire le notizie sull'AI per argomento?",
          a: "Nella sezione Temi le notizie di tutte le edizioni sono raccolte per argomento: AI Act e normativa, investimenti e round, intelligenza artificiale in Italia, data center e infrastrutture. Ogni pagina si aggiorna da sola a ogni nuova edizione e riporta le fonti originali.",
          link: { href: '/temi', label: 'Sfoglia le notizie per tema' },
        },
        {
          q: 'La newsletter AI Europa Weekly è gratuita? Quando esce?',
          a: "Sì, AI Europa Weekly è gratuita. Esce ogni domenica pomeriggio (ora italiana), così la trovi nella tua inbox il lunedì mattina. Per iscriverti basta l'email, senza carta di credito, e puoi disiscriverti in qualsiasi momento con un clic dal link in fondo a ogni email.",
          link: { href: '#subscribe', label: 'Iscriviti gratis' },
        },
        {
          q: 'Posso leggere le edizioni passate?',
          a: "Sì. Tutte le edizioni sono elencate nell'archivio. L'ultima è leggibile da chiunque; le precedenti sono riservate agli iscritti, che accedono con un link inviato via email, senza password. Le notizie su normativa, investimenti, Italia e infrastrutture sono consultabili da tutti anche nelle pagine per tema.",
          link: { href: '/weekly', label: "Vai all'archivio" },
        },
        {
          q: 'Come vengono selezionate e verificate le notizie?',
          a: "Monitoriamo ogni settimana oltre 30 fonti primarie in cinque lingue, tra testate, istituzioni e pubblicazioni di settore. Strumenti di AI ci aiutano a raccogliere e classificare gli articoli; la selezione finale, la scrittura e la verifica sono fatte dalla redazione. Ogni notizia riporta il link alla fonte originale e nessun contenuto è pubblicato senza revisione umana.",
        },
        {
          q: "Cos'è il Briefing Strategico Mensile?",
          a: "È il report premium di apulia.ai: 8–12 pagine in PDF, pubblicato il primo lunedì di ogni mese. Approfondisce i fatti del mese con contesto e implicazioni, il radar normativo, i briefing per paese, i round e le acquisizioni principali, le aziende da monitorare e uno scenario a 12 mesi.",
          link: { href: '#products', label: 'Scopri le analisi' },
        },
      ],
    },
    // Footer
    footer: {
      tagline: "L'AI in Europa. Ogni settimana.",
      links: {
        newsletter: 'Newsletter',
        analysis: 'Analisi',
        privacy: 'Privacy Policy',
        unsubscribe: 'Disiscrizione',
        about: 'Chi siamo',
        trainer: 'AI Trainer',
      },
      unsubscribeNote: 'Per disiscriverti, clicca il link in fondo a ogni email.',
      copyright: '© 2026 apulia.ai — Tutti i diritti riservati.',
      madeIn: 'Fatto con ☀️ in Puglia',
    },
  },
  en: {
    // Nav
    nav: {
      newsletter: 'Newsletter',
      analysis: 'Analysis',
      about: 'About',
      langToggle: 'IT',
    },
    // Hero
    hero: {
      tagline: 'AI in Europe. Every week.',
      headline: 'Artificial intelligence is redrawing the rules of the European economy.',
      headlineHighlight: 'Understand earlier. Decide better.',
      subtitle:
        'Every Sunday afternoon: AI Act regulatory developments, European venture capital movements and applied research analysed for their strategic implications on enterprises, investors and policy makers. Exclusive coverage of 10 EU countries with verified sources in 5 languages.',
      cta: 'Subscribe for free',
      ctaSubtext: 'No spam.',
    },
    // Stats
    stats: [
      { value: '€22 billion', label: 'invested in AI across Europe in 2024' },
      { value: 'AI Act', label: '1st global AI regulation, in force since 2024' },
      { value: '+67%', label: 'growth in EU AI startups 2023–2024' },
      { value: '€1.2 billion', label: 'Italian PNRR allocated to digital & AI' },
    ],
    // Products
    products: {
      sectionTitle: 'Two products, one mission',
      sectionSubtitle: 'Quality intelligence on European AI, at the depth you need.',
      weekly: {
        badge: 'Free',
        name: 'AI Europa Weekly',
        frequency: 'Every Sunday afternoon',
        description:
          'The weekly newsletter tracking the European AI ecosystem for you: regulation, startups, research and industrial policy. Ready in your inbox before Monday morning.',
        features: [
          '8 key facts ready for Monday morning',
          'EU AI Act and regulatory updates',
          'Startup moves and funding rounds',
          'Research and innovation highlights',
          'Hand-curated selected links',
        ],
        cta: 'Subscribe for free',
        price: 'Always free',
      },
      monthly: {
        badge: 'Premium',
        name: 'Monthly Strategic Briefing',
        frequency: 'First Monday of each month',
        description:
          'Deep-dive analysis for those making strategic AI decisions in Europe. Data, trends and opportunities in 8–12 dense pages.',
        features: [
          '8–12 page report in PDF and web',
          'Market opportunity map',
          'European investment & M&A radar',
          'Cross-country and sector comparisons',
          'Interviews with founders and decision-makers',
          'Full archive access',
        ],
        cta: 'Access the briefing',
        price: 'Coming soon',
        priceNote: 'Waitlist open',
      },
      apulia: {
        badge: 'Custom',
        name: 'Applied AI',
        frequency: 'Tailored to your business',
        description:
          'AI systems that read your market, connect to your data and tell your team what to do. Concrete decisions, not dashboards.',
        features: [
          'Industrialised sector intelligence',
          'Connected to your operational systems',
          'Internal data and process mapping',
          'Automated workflows for action',
          'Leadership-grade recommendations',
          'Pricing tied to outcomes',
        ],
        cta: 'Let\'s talk',
        price: 'On request',
        priceNote: 'Pilot programme launching',
      },
    },
    // Subscribe form
    form: {
      sectionTitle: 'Get started today',
      sectionSubtitle: 'Join those in Italy and Europe keeping their finger on the pulse of AI.',
      emailPlaceholder: 'Your email',
      emailLabel: 'Email address',
      productLabel: 'What would you like to receive?',
      products: {
        weekly: 'AI Europa Weekly (free)',
        monthly: 'Strategic Briefing (premium)',
        both: 'Both',
      },
      gdpr: 'I agree to the ',
      gdprLink: 'Privacy Policy',
      gdprSuffix: ' and the processing of my data to receive the newsletter.',
      submit: 'Subscribe',
      submitting: 'Subscribing...',
      successTitle: 'Subscription confirmed!',
      successMessage:
        'Check your email to confirm your subscription. See you in your inbox soon.',
      errorGeneric: 'Something went wrong. Please try again in a few seconds.',
      errorEmail: 'Please enter a valid email address.',
      errorGdpr: 'You must accept the Privacy Policy to subscribe.',
    },
    // Social proof
    audience: {
      sectionTitle: 'Built for decision-makers',
      sectionSubtitle:
        'From startup founders to policy makers, apulia.ai is the reference point for those working with or investing in AI across Italy and Europe.',
      personas: [
        {
          role: 'CTO / CIO',
          icon: '💻',
          description:
            'Track the technological and regulatory evolution to guide your organisation\'s infrastructure choices.',
        },
        {
          role: 'VC Investors',
          icon: '📈',
          description:
            'Identify the most promising European AI startups before they go mainstream, with data and sector analysis.',
        },
        {
          role: 'Startup Founders',
          icon: '🚀',
          description:
            'Navigate the AI Act, discover EU funds and grants, and find partnership opportunities in the EU market.',
        },
        {
          role: 'Policy Makers',
          icon: '🏛️',
          description:
            'Understand the impact of AI regulations on the Italian economy, with European comparisons and international benchmarks.',
        },
        {
          role: 'Strategy Consultants',
          icon: '🎯',
          description:
            'Bring clients up-to-date analysis on European AI: market dynamics, regulatory risks and competitive opportunities.',
        },
      ],
    },
    // Preview
    preview: {
      sectionTitle: 'A taste of the content',
      badge: 'Edition of 20 May 2026',
      headline: '5 facts on European AI this week',
      items: [
        {
          number: '01',
          title: 'EU approves first codes of conduct for general-purpose AI models',
          abstract:
            'The European Commission published operational guidelines for GPAI model providers above the 10²⁵ FLOP threshold. Google, Meta and Mistral are the first signatories.',
        },
        {
          number: '02',
          title: 'Italy: €340M from PNRR for AI computing centres in the South',
          abstract:
            'The Ministry of Enterprises confirms funding for three high-efficiency data centres in Puglia, Calabria and Sicily, focused on training domain-specific models.',
        },
        {
          number: '03',
          title: 'Mistral AI raises €600M: valuation at €6 billion',
          abstract:
            'The new General Catalyst-led round cements Mistral as the main European alternative to OpenAI. Milan office planned before Q4 2026.',
        },
      ],
      cta: 'Read the full edition',
    },
    // How It Works
    howItWorks: {
      sectionTitle: 'How it works',
      sectionSubtitle: 'Three steps to walk into Monday morning ready on European AI.',
      steps: [
        {
          number: '01',
          title: 'You subscribe',
          description: 'Enter your email. No credit card, no paywall. Just AI signal.',
        },
        {
          number: '02',
          title: 'Every Sunday afternoon',
          description: 'You receive 8 essential facts on European AI, curated by the apulia.ai team. Ready for Monday.',
        },
        {
          number: '03',
          title: 'Start the week ahead',
          description: 'Policy, startups, investments: Monday morning you already know what happened and why it matters.',
        },
      ],
    },
    // FAQ
    faq: {
      sectionTitle: 'Frequently Asked Questions',
      sectionSubtitle: 'The AI Act, investment, AI in Italy and how apulia.ai works.',
      items: [
        {
          q: 'What is apulia.ai and who is behind it?',
          a: 'apulia.ai is an independent publication on artificial intelligence in Europe and Italy, written for business decision-makers. Every week it publishes AI Europa Weekly: the developments that matter on regulation, investment, infrastructure and the Italian market, with original sources. It was founded by Massimiliano Masi, a former Partner at Boston Consulting Group, who signs every edition.',
          link: { href: '/chi-siamo', label: 'The apulia.ai team' },
        },
        {
          q: 'What are the AI Act deadlines after the Digital Omnibus?',
          a: 'The AI Act (Regulation (EU) 2024/1689) entered into force on 1 August 2024. Bans on prohibited practices apply from 2 February 2025 and the rules for general-purpose AI models from 2 August 2025. The Digital Omnibus (Regulation (EU) 2026/1744, in force since 27 July 2026) postponed the obligations for high-risk systems: to 2 December 2027 for Annex III systems (e.g. recruitment, credit scoring, biometrics) and to 2 August 2028 for AI embedded in regulated Annex I products such as medical devices.',
          link: { href: '/temi/ai-act', label: 'All AI Act updates (in Italian)' },
        },
        {
          q: "What does Italy's national AI law require?",
          a: 'With Law 132/2025, passed in September 2025, Italy became the first EU Member State to adopt a comprehensive AI law. On 10 June 2026 the Council of Ministers approved its two implementing decrees: they give supervisory powers to ACN (the National Cybersecurity Agency) and AgID, create a criminal offence for failing to apply safety measures to high-risk systems, and introduce a presumption of causality for damage caused by AI. They complement the AI Act rather than replace it.',
          link: { href: '/temi/ai-italia', label: 'AI in Italy news (in Italian)' },
        },
        {
          q: 'What penalties does the AI Act set for companies?',
          a: "AI Act fines reach up to €35 million or 7% of worldwide annual turnover for prohibited practices, up to €15 million or 3% for breaches of other obligations, and up to €7.5 million or 1% for supplying incorrect information to authorities. For SMEs and start-ups, the lower of the fixed amount and the percentage applies.",
          link: { href: '/temi/ai-act', label: 'AI Act and regulation updates (in Italian)' },
        },
        {
          q: 'Where can I track AI funding rounds and investment in Europe?',
          a: 'Every edition of AI Europa Weekly has a Funding & Markets section covering rounds, acquisitions and major investments in Europe and Italy. We collect them all, newest first, on a dedicated page updated every week, with a link to the source of each story.',
          link: { href: '/temi/investimenti-ai', label: 'AI investment and rounds (in Italian)' },
        },
        {
          q: 'How can I follow AI news by topic?',
          a: 'The Topics section groups the news from every edition by subject: the AI Act and regulation, investment and funding rounds, artificial intelligence in Italy, data centres and infrastructure. Each page updates automatically with every new edition and lists the original sources.',
          link: { href: '/temi', label: 'Browse news by topic (in Italian)' },
        },
        {
          q: 'Is AI Europa Weekly free? When is it published?',
          a: 'Yes, AI Europa Weekly is free. It is published every Sunday afternoon (Italian time), so it is in your inbox on Monday morning. You only need an email address to subscribe, no credit card, and you can unsubscribe at any time with one click from the link at the bottom of every email.',
          link: { href: '#subscribe', label: 'Subscribe for free' },
        },
        {
          q: 'Can I read past editions?',
          a: 'Yes. Every edition is listed in the archive. The latest one is open to everyone; earlier ones are reserved for subscribers, who sign in with a link sent by email, with no password. News on regulation, investment, Italy and infrastructure is also open to everyone on the topic pages.',
          link: { href: '/weekly', label: 'Go to the archive' },
        },
        {
          q: 'How are stories selected and verified?',
          a: 'Every week we monitor more than 30 primary sources in five languages, including news outlets, institutions and industry publications. AI tools help us collect and classify articles; final selection, writing and fact-checking are done by the editorial team. Every story links to its original source and nothing is published without human review.',
        },
        {
          q: 'What is the Monthly Strategic Briefing?',
          a: "It is apulia.ai's premium report: 8–12 pages in PDF, published on the first Monday of every month. It goes deeper into the month's developments with context and implications, the regulatory radar, country briefings, the main funding rounds and acquisitions, companies to watch and a 12-month outlook.",
          link: { href: '#products', label: 'Discover the analysis' },
        },
      ],
    },
    // Footer
    footer: {
      tagline: 'AI in Europe. Every week.',
      links: {
        newsletter: 'Newsletter',
        analysis: 'Analysis',
        privacy: 'Privacy Policy',
        unsubscribe: 'Unsubscribe',
        about: 'About',
        trainer: 'AI Trainer',
      },
      unsubscribeNote: 'To unsubscribe, click the link at the bottom of any email.',
      copyright: '© 2026 apulia.ai — All rights reserved.',
      madeIn: 'Made with ☀️ in Puglia',
    },
  },
} as const

// TranslationKeys is the shape of a single language object.
// We derive it from the 'it' locale and verify 'en' satisfies the same shape.
export type TranslationKeys = {
  nav: {
    newsletter: string
    analysis: string
    about: string
    langToggle: string
  }
  hero: {
    tagline: string
    headline: string
    headlineHighlight: string
    subtitle: string
    cta: string
    ctaSubtext: string
  }
  stats: readonly { readonly value: string; readonly label: string }[]
  products: {
    sectionTitle: string
    sectionSubtitle: string
    weekly: {
      badge: string
      name: string
      frequency: string
      description: string
      features: readonly string[]
      cta: string
      price: string
    }
    monthly: {
      badge: string
      name: string
      frequency: string
      description: string
      features: readonly string[]
      cta: string
      price: string
      priceNote: string
    }
    apulia: {
      badge: string
      name: string
      frequency: string
      description: string
      features: readonly string[]
      cta: string
      price: string
      priceNote: string
    }
  }
  form: {
    sectionTitle: string
    sectionSubtitle: string
    emailPlaceholder: string
    emailLabel: string
    productLabel: string
    products: {
      weekly: string
      monthly: string
      both: string
    }
    gdpr: string
    gdprLink: string
    gdprSuffix: string
    submit: string
    submitting: string
    successTitle: string
    successMessage: string
    errorGeneric: string
    errorEmail: string
    errorGdpr: string
  }
  audience: {
    sectionTitle: string
    sectionSubtitle: string
    personas: readonly { readonly role: string; readonly icon: string; readonly description: string }[]
  }
  preview: {
    sectionTitle: string
    badge: string
    headline: string
    items: readonly { readonly number: string; readonly title: string; readonly abstract: string }[]
    cta: string
  }
  howItWorks: {
    sectionTitle: string
    sectionSubtitle: string
    steps: readonly {
      readonly number: string
      readonly title: string
      readonly description: string
    }[]
  }
  faq: {
    sectionTitle: string
    sectionSubtitle: string
    items: readonly {
      readonly q: string
      readonly a: string
      readonly link?: { readonly href: string; readonly label: string }
    }[]
  }
  footer: {
    tagline: string
    links: {
      newsletter: string
      analysis: string
      privacy: string
      unsubscribe: string
      about: string
      trainer: string
    }
    unsubscribeNote: string
    copyright: string
    madeIn: string
  }
}

// Ensure both locales conform to the shape
const _itCheck: TranslationKeys = translations.it
const _enCheck: TranslationKeys = translations.en
void _itCheck
void _enCheck
