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
      sectionSubtitle: "Tutto quello che devi sapere sull'AI europea e su apulia.ai.",
      items: [
        {
          q: "Cos'è apulia.ai?",
          a: "apulia.ai è la newsletter italiana specializzata in intelligenza artificiale europea: una pubblicazione indipendente che esce ogni domenica pomeriggio (AI Europa Weekly, gratuita) per arrivare nella tua inbox prima del lunedì mattina, e ogni primo lunedì del mese (Briefing Strategico Mensile, premium). Copre EU AI Act, startup AI italiane ed europee, investimenti VC e pubblici, ricerca accademica, infrastrutture compute e politiche industriali nei 9 principali paesi EU più il Regno Unito.",
        },
        {
          q: "Cos'è l'EU AI Act e cosa cambia per le aziende italiane?",
          a: "L'EU AI Act (Regolamento UE 2024/1689) è il primo quadro normativo globale sull'intelligenza artificiale, entrato in vigore il 1° agosto 2024. Per le aziende italiane le scadenze chiave sono: febbraio 2025 (divieto sistemi AI inaccettabili — social scoring, manipolazione cognitiva), agosto 2025 (obblighi per modelli AI general-purpose, GPAI), agosto 2026 (conformità completa per sistemi ad alto rischio in HR, credito, sanità e infrastrutture critiche). Le sanzioni arrivano fino a €35 milioni o il 7% del fatturato globale.",
        },
        {
          q: 'La newsletter AI Europa Weekly è gratuita?',
          a: "Sì, AI Europa Weekly è completamente gratuita e lo rimarrà. Esce ogni domenica pomeriggio (orario CET) e arriva nella tua inbox in tempo per il lunedì mattina, con 8 sviluppi chiave della settimana, radar normativo EU AI Act, focus sull'ecosistema AI italiano, briefing per paese (Francia, Germania, Spagna, UK e altri), aggiornamenti su funding e startup europee. Iscrizione con sola email, nessuna carta di credito.",
        },
        {
          q: "Quando entra in vigore l'AI Act in Italia? Quali sono le scadenze?",
          a: "L'EU AI Act si applica in Italia secondo questo calendario: 2 febbraio 2025 — vietati i sistemi AI a rischio inaccettabile (social scoring, biometria in tempo reale in spazi pubblici, manipolazione subliminale). 2 agosto 2025 — requisiti per modelli AI general-purpose (GPAI) e modelli con impatto sistemico (>10²⁵ FLOPs di addestramento). 2 agosto 2026 — obblighi completi per sistemi ad alto rischio: selezione del personale, scoring creditizio, sistemi biometrici, istruzione, sanità, infrastrutture critiche. 2 agosto 2027 — adeguamento dei sistemi già in commercio prima di agosto 2026.",
        },
        {
          q: 'Quali startup AI italiane sono più rilevanti nel 2025–2026?',
          a: "Le startup AI italiane più rilevanti includono: Musixmatch (Milano, NLP per lyrics e metadata musicali, 100M+ utenti), Translated (Roma, piattaforma traduzione AI e dati per LLM), Datrix (Milano, AI predittiva e NLP enterprise), Spindox (AI consulting per PA e banche), TeaStore (AI per retail e supply chain). Sul fronte corporate, Leonardo, Fincantieri, Intesa Sanpaolo e Generali investono centinaia di milioni in AI. La Fondazione FAIR finanziata dal PNRR con €114M coordina la ricerca AI nazionale.",
        },
        {
          q: "Quanto investe l'Europa in intelligenza artificiale?",
          a: "Nel 2024 gli investimenti in AI in Europa hanno superato €22 miliardi (+67% crescita startup AI UE rispetto al 2023). Per paese: Francia >€6 miliardi (piano IA Macron), Germania >€5 miliardi (Zukunftsstrategie KI), UK >£2,5 miliardi (AI Opportunities Action Plan), Italia ~€3,5 miliardi (PNRR + privati). L'infrastruttura compute europea include i supercomputer EuroHPC: Leonardo a Bologna (4° al mondo per potenza), LUMI in Finlandia e Marenostrum 5 in Spagna.",
        },
        {
          q: "Cos'è il Briefing Strategico Mensile di apulia.ai?",
          a: "Il Briefing Strategico Mensile è la pubblicazione premium di apulia.ai: un report di 8–12 pagine in PDF pubblicato ogni primo lunedì del mese. Include executive summary bilingue (italiano e inglese), analisi strategica mensile con fatto/contesto/implicazione, radar normativo approfondito, briefing per i 9 paesi EU principali più UK, analisi dei round di finanziamento e M&A, Company Watch (5 aziende da monitorare con motivazione strategica), matrice capacità AI per paese e settore, e outlook a 12 mesi.",
        },
        {
          q: "Come mi iscrivo alla newsletter sull'AI europea?",
          a: "L'iscrizione è gratuita e richiede meno di 30 secondi: inserisci la tua email nel form in fondo alla pagina, scegli se ricevere solo la AI Europa Weekly (gratuita, ogni domenica pomeriggio) o anche il Briefing Strategico Mensile (premium), accetta la privacy policy GDPR e clicca Iscriviti. Riceverai una email di conferma entro pochi minuti. Puoi disdire in qualsiasi momento con un click, senza preavviso.",
        },
        {
          q: "Quali sono i principali modelli AI europei alternativi a ChatGPT?",
          a: "I principali modelli AI fondazionali europei sono: Mistral AI (Francia) con Mistral 7B, Mixtral 8x7B e Mistral Large — open-weight, disponibili su Hugging Face; Aleph Alpha (Germania) con Luminous, focalizzato su sovranità digitale e uso nella PA europea; Silo AI (Finlandia, acquisita da AMD) con modelli multilingue europei; LightOn (Francia) per AI enterprise. La Commissione Europea finanzia lo sviluppo di modelli AI europei attraverso il programma AI Factories nell'ambito di EuroHPC.",
        },
        {
          q: "Come viene prodotta la newsletter? È curata da redattori o generata da AI?",
          a: "La newsletter usa un sistema editoriale ibrido: raccolta automatica da oltre 30 fonti primarie (Wired Italia, Il Sole 24 Ore Tecnologia, AgendaDigitale, Sifted, Tech.eu, POLITICO Tech, MIT Technology Review e altri), classificazione e prioritizzazione con modelli AI, redazione e verifica finale da parte del team editoriale umano. Ogni notizia cita le fonti originali. Non pubblichiamo contenuti generati interamente da AI senza revisione umana.",
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
      sectionSubtitle: 'Everything you need to know about European AI and apulia.ai.',
      items: [
        {
          q: 'What is apulia.ai?',
          a: 'apulia.ai is Italy\'s independent newsletter specialised in European artificial intelligence: published every Sunday afternoon (AI Europa Weekly, free) — landing in your inbox ready for Monday morning — and every first Monday of the month (Monthly Strategic Briefing, premium). It covers the EU AI Act, Italian and European AI startups, VC and public investment, academic research, compute infrastructure and industrial policy across 9 major EU countries plus the UK.',
        },
        {
          q: 'What is the EU AI Act and what does it mean for companies?',
          a: 'The EU AI Act (Regulation EU 2024/1689) is the world\'s first comprehensive AI regulatory framework, in force since 1 August 2024. Key deadlines: February 2025 (ban on unacceptable AI — social scoring, cognitive manipulation); August 2025 (requirements for general-purpose AI models, GPAI); August 2026 (full compliance for high-risk systems in HR, credit, healthcare and critical infrastructure). Penalties reach up to €35 million or 7% of global turnover.',
        },
        {
          q: 'Is the AI Europa Weekly newsletter free?',
          a: 'Yes, AI Europa Weekly is completely free and will remain so. Published every Sunday afternoon (CET) so it lands in your inbox in time for Monday morning, with 8 key weekly developments, EU AI Act regulatory radar, Italian AI ecosystem focus, per-country briefings (France, Germany, Spain, UK and others), and startup funding updates. Sign up with just your email — no credit card required.',
        },
        {
          q: 'When does the AI Act come into force? What are the key deadlines?',
          a: 'The EU AI Act timeline: 2 February 2025 — unacceptable-risk AI systems banned (social scoring, real-time biometrics in public spaces, subliminal manipulation). 2 August 2025 — general-purpose AI (GPAI) model requirements apply, including systemic-impact models (>10²⁵ FLOPs training compute). 2 August 2026 — full obligations for high-risk systems: HR selection, credit scoring, biometric systems, education, healthcare, critical infrastructure management. 2 August 2027 — high-risk systems already on market before August 2026 must comply.',
        },
        {
          q: 'Which Italian AI startups are most relevant in 2025–2026?',
          a: 'Leading Italian AI startups include: Musixmatch (Milan, NLP for music lyrics and metadata, 100M+ users), Translated (Rome, AI translation platform and LLM training data), Datrix (Milan, predictive AI and enterprise NLP), Spindox (AI consulting for public sector and banks), TeaStore (AI for retail and supply chain). On the corporate side, Leonardo, Fincantieri, Intesa Sanpaolo and Generali are each investing hundreds of millions in AI. The PNRR-funded Fondazione FAIR (€114M) coordinates national AI research.',
        },
        {
          q: 'How much does Europe invest in artificial intelligence?',
          a: 'In 2024, AI investments in Europe exceeded €22 billion, with EU AI startup growth of +67% versus 2023. By country: France >€6 billion (Macron AI plan), Germany >€5 billion (Zukunftsstrategie KI), UK >£2.5 billion (AI Opportunities Action Plan), Italy ~€3.5 billion (PNRR + private). European compute infrastructure includes EuroHPC supercomputers: Leonardo in Bologna (4th globally by power), LUMI in Finland and Marenostrum 5 in Spain.',
        },
        {
          q: 'What is the Monthly Strategic Briefing from apulia.ai?',
          a: 'The Monthly Strategic Briefing is the premium publication from apulia.ai: an 8–12 page PDF report published every first Monday of the month. It includes a bilingual executive summary (Italian and English), monthly strategic analysis with fact/context/implication structure, in-depth regulatory radar, per-country briefings for 9 EU countries plus UK, funding round and M&A analysis, Company Watch (5 companies to monitor with strategic rationale), updated AI capability matrix by country and sector, and a 12-month outlook.',
        },
        {
          q: 'How do I subscribe to the European AI newsletter?',
          a: 'Subscribing is free and takes under 30 seconds: enter your email in the form at the bottom of the page, choose whether to receive just the free AI Europa Weekly (every Sunday afternoon) or also the premium Monthly Strategic Briefing, accept the GDPR privacy policy and click Subscribe. You will receive a confirmation email within a few minutes. You can unsubscribe at any time with one click — no notice period required.',
        },
        {
          q: 'What are the main European AI models alternative to ChatGPT?',
          a: 'The main European foundational AI models are: Mistral AI (France) with Mistral 7B, Mixtral 8x7B and Mistral Large — open-weight models available on Hugging Face; Aleph Alpha (Germany) with Luminous, focused on digital sovereignty and EU public sector use; Silo AI (Finland, acquired by AMD) with European multilingual models; LightOn (France) for enterprise AI. The European Commission funds European AI model development through the AI Factories programme under EuroHPC.',
        },
        {
          q: 'How is the newsletter produced — is it AI-generated or human-edited?',
          a: 'The newsletter uses a hybrid editorial system: automated collection from 30+ primary sources (Wired Italia, Il Sole 24 Ore Tecnologia, AgendaDigitale, Sifted, Tech.eu, POLITICO Tech, MIT Technology Review and others), AI-assisted classification and prioritisation, and final writing and fact-checking by a human editorial team. Every story cites its original sources. We do not publish fully AI-generated content without human review.',
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
    items: readonly { readonly q: string; readonly a: string }[]
  }
  footer: {
    tagline: string
    links: {
      newsletter: string
      analysis: string
      privacy: string
      unsubscribe: string
      about: string
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
