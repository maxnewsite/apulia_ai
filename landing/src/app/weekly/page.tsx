import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAllIssues } from '@/lib/newsletter-issues'
import {
  formatItalianDate,
  parseSlugDate,
  stripSlugPrefix,
} from '@/lib/newsletter-html'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Archivio AI Europa Weekly — Tutte le edizioni',
  description:
    "Archivio completo della newsletter AI Europa Weekly di apulia.ai. Tutte le edizioni settimanali sull'intelligenza artificiale in Europa e in Italia: EU AI Act, startup, investimenti, ricerca.",
  alternates: {
    canonical: 'https://apulia.ai/weekly',
  },
  openGraph: {
    title: 'Archivio AI Europa Weekly',
    description:
      "Tutte le edizioni della newsletter settimanale apulia.ai sull'intelligenza artificiale in Europa.",
    type: 'website',
    url: 'https://apulia.ai/weekly',
  },
}

export default async function WeeklyArchivePage() {
  const issues = await getAllIssues('weekly')

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://apulia.ai/weekly#collection',
    name: 'Archivio AI Europa Weekly',
    description:
      "Tutte le edizioni della newsletter settimanale sull'AI europea pubblicate da apulia.ai.",
    url: 'https://apulia.ai/weekly',
    inLanguage: 'it-IT',
    isPartOf: { '@id': 'https://apulia.ai/#weekly' },
    publisher: { '@id': 'https://apulia.ai/#organization' },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: issues.length,
      itemListElement: issues.map((issue, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://apulia.ai/weekly/${stripSlugPrefix(issue.slug)}`,
        name: issue.title,
      })),
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://apulia.ai/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Archivio Weekly',
        item: 'https://apulia.ai/weekly',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Header />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-16">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 text-sm text-[#94A3B8]"
        >
          <Link
            href="/"
            className="hover:text-[#F0F4FF] transition-colors"
          >
            Home
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-[#F0F4FF]">Archivio Weekly</span>
        </nav>

        <header className="mb-12 pb-8 border-b border-[#1E3A5F]">
          <div className="text-xs uppercase tracking-[0.18em] text-[#2563EB] font-bold mb-3">
            AI Europa Weekly
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#F0F4FF] leading-tight mb-4">
            Archivio edizioni
          </h1>
          <p className="text-lg text-[#94A3B8] max-w-2xl">
            Tutte le edizioni della newsletter settimanale sull&apos;
            intelligenza artificiale in Europa. {issues.length}{' '}
            {issues.length === 1 ? 'edizione pubblicata' : 'edizioni pubblicate'}.
          </p>
        </header>

        {issues.length === 0 ? (
          <div className="text-center py-16 bg-[#0F1A2E] border border-[#1E3A5F] rounded-2xl">
            <p className="text-[#94A3B8] mb-6">
              Nessuna edizione disponibile al momento.
            </p>
            <Link
              href="/#subscribe"
              className="inline-block px-6 py-3 bg-[#2563EB] text-white font-semibold rounded-full hover:bg-[#1d4ed8] transition-colors text-sm"
            >
              Iscriviti per la prossima
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {issues.map((issue) => {
              const urlSlug = stripSlugPrefix(issue.slug)
              const date = parseSlugDate(issue.slug)
              return (
                <li key={issue.id}>
                  <Link
                    href={`/weekly/${urlSlug}`}
                    className="block p-6 md:p-7 bg-[#0F1A2E] border border-[#1E3A5F] rounded-2xl hover:border-[#2563EB] transition-colors group"
                  >
                    <div className="flex items-baseline justify-between gap-4 mb-2 flex-wrap">
                      <span className="text-xs uppercase tracking-wider text-[#94A3B8] font-semibold">
                        Edizione #{issue.issue_number}
                        {date && (
                          <>
                            <span className="mx-2" aria-hidden="true">
                              ·
                            </span>
                            <time dateTime={date}>
                              {formatItalianDate(date)}
                            </time>
                          </>
                        )}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-[#F0F4FF] group-hover:text-[#2563EB] transition-colors mb-2">
                      {issue.title}
                    </h2>
                    {issue.dek && (
                      <p className="text-sm md:text-base text-[#94A3B8] leading-relaxed">
                        {issue.dek}
                      </p>
                    )}
                    <div className="mt-4 text-sm text-[#2563EB] font-semibold inline-flex items-center gap-1">
                      Leggi l&apos;edizione
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                        className="group-hover:translate-x-0.5 transition-transform"
                      >
                        <path
                          d="M9 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        <aside className="mt-16 p-8 md:p-10 bg-gradient-to-br from-[#0F1A2E] to-[#050A14] border border-[#1E3A5F] rounded-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-3 text-[#F0F4FF]">
            Non perdere la prossima edizione
          </h2>
          <p className="text-[#94A3B8] mb-6 max-w-xl mx-auto">
            Iscriviti gratis: la newsletter arriva ogni domenica pomeriggio,
            pronta per il tuo lunedì mattina.
          </p>
          <Link
            href="/#subscribe"
            className="inline-block px-8 py-3 bg-[#2563EB] text-white font-semibold rounded-full hover:bg-[#1d4ed8] transition-colors shadow-lg shadow-[#2563EB]/20"
          >
            Iscriviti gratis
          </Link>
        </aside>
      </main>

      <Footer />
    </>
  )
}
