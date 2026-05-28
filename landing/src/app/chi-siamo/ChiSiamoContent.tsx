'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

const content = {
  it: {
    breadcrumb: 'Chi siamo',
    badge: 'apulia.ai',
    h1: 'Chi siamo',
    intro:
      "Una pubblicazione indipendente sull'intelligenza artificiale europea, fondata da chi ha operato ai massimi livelli della strategia d'impresa per oltre vent'anni.",
    founderLabel: 'Founder',
    founderTitle: 'Ex Partner, Boston Consulting Group',
    credentials: [
      '25+ anni in strategia, finanza e leadership',
      'CEO e CFO di società quotate europee',
      'Senior Executive Programme in AI Adoption, NUS Business School',
      'Certified Professional Coach, iPEC',
      'ELI Master Practitioner',
    ],
    connectLinkedIn: 'Connettiti su LinkedIn',
    nusLabel: 'Senior Executive Programme in AI Adoption',
    nusSub: 'NUS Business School, National University of Singapore',
    sections: [
      {
        title: 'Il percorso',
        body: [
          "Massimiliano Masi ha costruito la propria carriera ai vertici della consulenza strategica internazionale come Partner di Boston Consulting Group, con un focus specializzato nel settore energia e utilities. In oltre venticinque anni ha affiancato consigli di amministrazione, CEO e CFO di aziende complesse, incluse società quotate europee, su sfide critiche di trasformazione strategica, gestione del capitale e delivery operativa.",
        ],
      },
      {
        title: "Dalla strategia all'intelligenza artificiale",
        body: [
          "Negli ultimi anni ha orientato la propria attività verso l'intersezione tra strategia d'impresa e adozione dell'AI: non come fenomeno tecnologico isolato, ma come variabile strutturale che ridefinisce modelli di business, allocazione del capitale e competitività industriale. Ha completato il Senior Executive Programme in AI Adoption presso NUS Business School della National University of Singapore, consolidando la propria competenza tecnica e strategica sul tema.",
          "Lavora con imprese e C-suite attraverso advisory frazionale e percorsi di coaching esecutivo certificato, con particolare attenzione alla decarbonizzazione industriale e alle opportunità generate dalla regolamentazione europea.",
        ],
      },
      {
        title: 'Perché apulia.ai',
        body: [
          "apulia.ai porta il nome della Puglia. Massimiliano è nato a Bari e la Puglia è parte di chi è: la sua luce, la sua concretezza, il suo essere ponte tra Mediterraneo e Europa. Il nome non è un dettaglio di branding, è una dichiarazione di origine e di prospettiva.",
          "La newsletter nasce da una constatazione precisa: l'ecosistema AI europeo evolve a una velocità che il management tradizionale fatica a seguire con gli strumenti informativi disponibili. Le fonti esistenti sono frammentate per lingua, frammentate per paese, o orientate al pubblico generalista. Manca un punto di sintesi professionale in italiano che metta in relazione normativa, capitale e ricerca con le implicazioni concrete per chi decide.",
          "È pensata per chi non ha bisogno di essere convinto che l'AI conti, ma ha bisogno di capire esattamente cosa sta succedendo in Europa, dove si muove il capitale, quali obblighi normativi si avvicinano e quali opportunità stanno emergendo prima che diventino evidenti.",
        ],
      },
      {
        title: 'Il metodo editoriale',
        body: [
          "Ogni edizione di AI Europa Weekly sintetizza sviluppi da oltre 30 fonti primarie in cinque lingue: inglese, italiano, francese, tedesco e spagnolo, con copertura sistematica di dieci paesi EU più il Regno Unito. La selezione è guidata dalla rilevanza strategica: normativa con impatto diretto sulle imprese, movimenti di capitale significativi, ricerca con orizzonte applicativo a 12-24 mesi. Nessun contenuto viene pubblicato senza verifica delle fonti originali.",
        ],
      },
    ],
    networkTitle: 'La rete editoriale',
    networkBody:
      "apulia.ai fa parte di una rete editoriale più ampia. La pubblicazione gemella kalym.me copre l'intelligenza artificiale nel Medio Oriente e nell'area MENA: stessa metodologia, stesso rigore, prospettiva geopolitica diversa.",
    networkCta: 'Scopri kalym.me',
    competenceTitle: 'Aree di competenza',
    competences: [
      {
        title: 'AI Strategy',
        body: "Sviluppo di strategie di adozione AI e go-to-market per imprese e startup, dalla definizione del MVP fino all'execution.",
      },
      {
        title: 'C-Level Advisory',
        body: 'Coaching esecutivo e advisory frazionale per CEO, CFO e board. Certificazione iPEC e ELI Master Practitioner.',
      },
      {
        title: 'Decarbonizzazione Industriale',
        body: 'Punto di convergenza tra ingegneria, project finance e politica industriale europea per la transizione energetica.',
      },
    ],
    ctaTitle: "Ricevi l'analisi ogni domenica",
    ctaBody: 'AI Europa Weekly è gratuita. Pronta nella tua inbox prima del lunedì mattina.',
    ctaBtn: 'Iscriviti gratis',
  },
  en: {
    breadcrumb: 'About',
    badge: 'apulia.ai',
    h1: 'About',
    intro:
      'An independent publication on European artificial intelligence, founded by someone who has operated at the highest levels of corporate strategy for over twenty years.',
    founderLabel: 'Founder',
    founderTitle: 'Former Partner, Boston Consulting Group',
    credentials: [
      '25+ years in strategy, finance and leadership',
      'CEO and CFO of complex European listed companies',
      'Senior Executive Programme in AI Adoption, NUS Business School',
      'Certified Professional Coach, iPEC',
      'ELI Master Practitioner',
    ],
    connectLinkedIn: 'Connect on LinkedIn',
    nusLabel: 'Senior Executive Programme in AI Adoption',
    nusSub: 'NUS Business School, National University of Singapore',
    sections: [
      {
        title: 'Background',
        body: [
          'Massimiliano Masi built his career at the top of international strategic consulting as a Partner at Boston Consulting Group, with a specialised focus on the energy and utilities sector. Over more than twenty-five years he has worked alongside boards, CEOs and CFOs of complex organisations, including European listed companies, on critical strategic transformation challenges, capital management and operational delivery.',
        ],
      },
      {
        title: 'From strategy to artificial intelligence',
        body: [
          "In recent years he has directed his work towards the intersection of corporate strategy and AI adoption: not as an isolated technology phenomenon, but as a structural variable that redefines business models, capital allocation and industrial competitiveness. He completed the Senior Executive Programme in AI Adoption at NUS Business School, National University of Singapore, strengthening his technical and strategic expertise on the subject.",
          'He works with enterprises and C-suites through fractional advisory and certified executive coaching, with a particular focus on industrial decarbonisation and the opportunities created by European regulation.',
        ],
      },
      {
        title: 'Why apulia.ai',
        body: [
          'apulia.ai takes its name from Puglia. Massimiliano was born in Bari and Puglia is part of who he is: its light, its directness, its role as a bridge between the Mediterranean and Europe. The name is not a branding detail, it is a declaration of origin and perspective.',
          'The newsletter was born from a precise observation: the European AI ecosystem evolves at a speed that traditional management struggles to follow with the information tools available. Existing sources are fragmented by language, fragmented by country, or aimed at a general audience. There is no professional synthesis in English that connects regulation, capital and research with the concrete implications for decision-makers.',
          "It is designed for those who do not need to be convinced that AI matters, but need to understand exactly what is happening in Europe, where capital is moving, which regulatory obligations are approaching and which opportunities are emerging before they become obvious.",
        ],
      },
      {
        title: 'Editorial method',
        body: [
          'Each edition of AI Europa Weekly synthesises developments from over 30 primary sources in five languages: English, Italian, French, German and Spanish, with systematic coverage of ten EU countries plus the United Kingdom. Selection is driven by strategic relevance: regulation with direct impact on businesses, significant capital movements, research with a 12 to 24 month application horizon. No content is published without verification of original sources.',
        ],
      },
    ],
    networkTitle: 'The editorial network',
    networkBody:
      'apulia.ai is part of a wider editorial network. The sister publication kalym.me covers artificial intelligence in the Middle East and the MENA region: same methodology, same rigour, different geopolitical perspective.',
    networkCta: 'Discover kalym.me',
    competenceTitle: 'Areas of expertise',
    competences: [
      {
        title: 'AI Strategy',
        body: 'Development of AI adoption and go-to-market strategies for enterprises and startups, from MVP definition through to execution.',
      },
      {
        title: 'C-Level Advisory',
        body: 'Executive coaching and fractional advisory for CEOs, CFOs and boards. iPEC certification and ELI Master Practitioner.',
      },
      {
        title: 'Industrial Decarbonisation',
        body: 'Convergence point between engineering, project finance and European industrial policy for the energy transition.',
      },
    ],
    ctaTitle: 'Receive the analysis every Sunday',
    ctaBody: 'AI Europa Weekly is free. In your inbox before Monday morning.',
    ctaBtn: 'Subscribe for free',
  },
}

export default function ChiSiamoContent({ isSubPage = false }: { isSubPage?: boolean }) {
  const { language } = useLanguage()
  const c = content[language]

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-16">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[#94A3B8]">
        <Link href="/" className="hover:text-[#F0F4FF] transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        {isSubPage ? (
          <>
            <Link href="/chi-siamo" className="hover:text-[#F0F4FF] transition-colors">
              {c.breadcrumb}
            </Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-[#F0F4FF]">Massimiliano Masi</span>
          </>
        ) : (
          <span className="text-[#F0F4FF]">{c.breadcrumb}</span>
        )}
      </nav>

      {/* Page header */}
      <header className="mb-16 pb-10 border-b border-[#1E3A5F]">
        <div className="text-xs uppercase tracking-[0.18em] text-[#2563EB] font-bold mb-3">
          {c.badge}
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#F0F4FF] leading-tight mb-6">
          {c.h1}
        </h1>
        <p className="text-xl text-[#94A3B8] max-w-2xl leading-relaxed">{c.intro}</p>
      </header>

      {/* Founder section */}
      <section aria-labelledby="founder-heading" className="mb-16">
        <div className="grid md:grid-cols-3 gap-10 md:gap-16">

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="sticky top-28 space-y-4">

              {/* Profile photo */}
              <div className="overflow-hidden rounded-2xl border border-[#1E3A5F]">
                <img
                  src="https://spiridione.com/images/image1.jpeg"
                  alt="Massimiliano Masi"
                  className="w-full object-cover object-top aspect-[3/4]"
                  loading="eager"
                />
              </div>

              {/* Card */}
              <div className="p-6 bg-[#0F1A2E] border border-[#1E3A5F] rounded-2xl">
                <div className="text-xs uppercase tracking-widest text-[#2563EB] font-bold mb-4">
                  {c.founderLabel}
                </div>
                <h2 id="founder-heading" className="text-2xl font-black text-[#F0F4FF] mb-1">
                  Massimiliano Masi
                </h2>
                <p className="text-sm text-[#94A3B8] mb-6 leading-relaxed">{c.founderTitle}</p>

                <ul className="space-y-3 text-sm text-[#94A3B8]">
                  {c.credentials.map((cred) => (
                    <li key={cred} className="flex items-start gap-2.5">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0" />
                      {cred}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-5 border-t border-[#1E3A5F] flex items-center justify-between">
                  <a
                    href="https://spiridione.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#60A5FA] transition-colors"
                  >
                    spiridione.com
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/massimiliano-masi-4265ab"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="text-[#0A66C2] hover:opacity-80 transition-opacity"
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* NUS badge */}
              <div className="p-4 bg-[#0F1A2E] border border-[#1E3A5F] rounded-2xl flex items-center gap-4">
                <img
                  src="/nus_business_school.png"
                  alt="NUS Business School"
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-[#F0F4FF] leading-snug">{c.nusLabel}</p>
                  <p className="text-xs text-[#94A3B8] mt-1">{c.nusSub}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Bio */}
          <div className="md:col-span-2 space-y-8 text-[#94A3B8] leading-relaxed">
            {c.sections.map((section) => (
              <div key={section.title}>
                <h3 className="text-lg font-bold text-[#F0F4FF] mb-3">{section.title}</h3>
                {section.body.map((para, i) => (
                  <p key={i} className={i > 0 ? 'mt-4' : ''}>{para}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial network */}
      <section className="mb-16 p-8 md:p-10 rounded-2xl border border-[#1E3A5F] bg-[#0F1A2E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-[#F59E0B] font-bold mb-2">
            {c.networkTitle}
          </div>
          <p className="text-[#94A3B8] leading-relaxed max-w-xl">{c.networkBody}</p>
        </div>
        <a
          href="https://kalym.me"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#F59E0B]/40 text-[#F59E0B] font-semibold text-sm hover:bg-[#F59E0B]/10 transition-colors"
        >
          {c.networkCta}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </section>

      {/* Competences */}
      <section aria-labelledby="competence-heading" className="mb-16">
        <h2 id="competence-heading" className="text-2xl font-black text-[#F0F4FF] mb-8">
          {c.competenceTitle}
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {c.competences.map((area) => (
            <div
              key={area.title}
              className="p-6 bg-[#0F1A2E] border border-[#1E3A5F] rounded-2xl hover:border-[#2563EB]/40 transition-colors"
            >
              <h3 className="text-base font-bold text-[#F0F4FF] mb-3">{area.title}</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">{area.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LinkedIn CTA */}
      <section className="mb-16 flex justify-center">
        <a
          href="https://www.linkedin.com/in/massimiliano-masi-4265ab"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-4 px-8 py-5 bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold rounded-2xl transition-colors shadow-lg shadow-[#0A66C2]/20"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          <div className="text-left">
            <div className="text-lg font-bold leading-tight">Massimiliano Masi</div>
            <div className="text-sm text-white/80 font-normal">{c.connectLinkedIn}</div>
          </div>
        </a>
      </section>

      {/* Subscribe CTA */}
      <aside className="p-8 md:p-10 bg-[#0F1A2E] border border-[#1E3A5F] rounded-2xl text-center">
        <h2 className="text-2xl md:text-3xl font-black mb-3 text-[#F0F4FF]">{c.ctaTitle}</h2>
        <p className="text-[#94A3B8] mb-6 max-w-xl mx-auto">{c.ctaBody}</p>
        <Link
          href="/#subscribe"
          className="inline-block px-8 py-3 bg-[#2563EB] text-white font-semibold rounded-full hover:bg-[#1d4ed8] transition-colors shadow-lg shadow-[#2563EB]/20"
        >
          {c.ctaBtn}
        </Link>
      </aside>

    </main>
  )
}
