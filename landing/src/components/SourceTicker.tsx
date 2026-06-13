'use client'

import { useLanguage } from '@/context/LanguageContext'

type Source = {
  name: string
  url: string
  tier: 'tier1' | 'tier2'
}

const SOURCES: readonly Source[] = [
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/', tier: 'tier1' },
  { name: 'POLITICO Europe', url: 'https://www.politico.eu/', tier: 'tier1' },
  { name: 'Reuters', url: 'https://www.reuters.com/technology/', tier: 'tier1' },
  { name: 'Bloomberg', url: 'https://www.bloomberg.com/technology', tier: 'tier1' },
  { name: 'Financial Times', url: 'https://www.ft.com/artificial-intelligence', tier: 'tier1' },
  { name: 'WIRED', url: 'https://www.wired.it/', tier: 'tier1' },
  { name: 'Il Sole 24 Ore', url: 'https://www.ilsole24ore.com/', tier: 'tier1' },
  { name: 'Sifted', url: 'https://sifted.eu/', tier: 'tier2' },
  { name: 'Tech.eu', url: 'https://tech.eu/', tier: 'tier2' },
  { name: 'Agenda Digitale', url: 'https://www.agendadigitale.eu/', tier: 'tier2' },
  { name: 'VentureBeat', url: 'https://venturebeat.com/category/ai/', tier: 'tier2' },
  { name: 'StartupItalia', url: 'https://startupitalia.eu/', tier: 'tier2' },
  { name: 'EU Startups', url: 'https://www.eu-startups.com/', tier: 'tier2' },
  { name: 'AI4Business', url: 'https://www.ai4business.it/', tier: 'tier2' },
  { name: 'CorCom', url: 'https://www.corrierecomunicazioni.it/', tier: 'tier2' },
  { name: 'Silicon Canals', url: 'https://siliconcanals.com/', tier: 'tier2' },
]

const COPY = {
  it: {
    title: 'Le fonti che leggiamo per te',
    subtitle: 'Oltre 30 testate primarie monitorate ogni settimana. Tu ricevi solo il segnale.',
    ariaLabel: 'Lista delle fonti monitorate',
  },
  en: {
    title: 'The sources we read for you',
    subtitle: 'Over 30 primary outlets monitored every week. You receive only the signal.',
    ariaLabel: 'List of monitored sources',
  },
} as const

export default function SourceTicker() {
  const { language } = useLanguage()
  const copy = COPY[language]

  // Duplicate the list so the marquee loops seamlessly
  const items = [...SOURCES, ...SOURCES]

  return (
    <section
      className="relative py-16 border-y border-[#E2E8F0]/40 bg-[#FFFFFF] overflow-hidden"
      aria-labelledby="sources-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        <h2
          id="sources-heading"
          className="text-xs font-bold tracking-[0.18em] uppercase text-[#475569] mb-3"
        >
          {copy.title}
        </h2>
        <p className="text-sm md:text-base text-[#0F172A]/70 max-w-2xl mx-auto">
          {copy.subtitle}
        </p>
      </div>

      {/* Marquee container with edge fades */}
      <div
        className="relative w-full overflow-hidden"
        role="region"
        aria-label={copy.ariaLabel}
      >
        {/* Left fade */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[#FFFFFF] to-transparent"
          aria-hidden="true"
        />
        {/* Right fade */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[#FFFFFF] to-transparent"
          aria-hidden="true"
        />

        <ul className="source-marquee flex items-center gap-12 py-4 whitespace-nowrap will-change-transform">
          {items.map((source, i) => (
            <li key={`${source.name}-${i}`} className="flex-shrink-0">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  'inline-flex items-center text-base md:text-lg font-semibold tracking-tight transition-colors duration-200',
                  source.tier === 'tier1'
                    ? 'text-[#0F172A] hover:text-[#2563EB]'
                    : 'text-[#475569] hover:text-[#0F172A]',
                ].join(' ')}
                aria-label={`${source.name} — fonte esterna`}
              >
                {source.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
