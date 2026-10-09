import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAllIssues } from '@/lib/newsletter-issues'
import { formatItalianDate } from '@/lib/newsletter-html'
import { FOUNDER, founderRef, SITE_URL } from '@/lib/seo-entities'
import {
  MIN_TOPIC_ITEMS,
  TOPICS,
  buildTopicEditions,
  countItems,
  getTopic,
} from '@/lib/topics'

// Pagina pubblica uguale per tutti: rigenerata al massimo ogni ora, così una
// nuova edizione compare senza deploy.
export const revalidate = 3600

type Params = Promise<{ topic: string }>

export function generateStaticParams() {
  return TOPICS.map((t) => ({ topic: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { topic: slug } = await params
  const topic = getTopic(slug)
  if (!topic) return { title: 'Tema non trovato', robots: { index: false } }
  const url = `${SITE_URL}/temi/${topic.slug}`
  return {
    title: topic.title,
    description: topic.description,
    authors: [{ name: FOUNDER.name, url: FOUNDER.url }],
    alternates: { canonical: url },
    openGraph: {
      title: topic.title,
      description: topic.description,
      type: 'website',
      url,
    },
  }
}

export default async function TopicPage({ params }: { params: Params }) {
  const { topic: slug } = await params
  const topic = getTopic(slug)
  if (!topic) notFound()

  const issues = await getAllIssues('weekly')
  const editions = buildTopicEditions(topic, issues)
  const total = countItems(editions)
  if (total < MIN_TOPIC_ITEMS) notFound()

  const updated = editions[0]?.date ?? null
  const url = `${SITE_URL}/temi/${topic.slug}`

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    name: topic.title,
    description: topic.description,
    url,
    inLanguage: 'it-IT',
    dateModified: updated ?? undefined,
    author: founderRef,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    about: topic.name,
    hasPart: editions.map((e) => ({
      '@type': 'NewsArticle',
      '@id': `${SITE_URL}/weekly/${e.slug}#article`,
      headline: e.title,
      url: `${SITE_URL}/weekly/${e.slug}`,
      datePublished: e.date ?? undefined,
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Temi', item: `${SITE_URL}/temi` },
      { '@type': 'ListItem', position: 3, name: topic.name, item: url },
    ],
  }

  const others = TOPICS.filter((t) => t.slug !== topic.slug)

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

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-16">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[#475569]">
          <Link href="/" className="hover:text-[#0F172A] transition-colors">
            Home
          </Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <Link href="/temi" className="hover:text-[#0F172A] transition-colors">
            Temi
          </Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-[#0F172A]">{topic.name}</span>
        </nav>

        <header className="mb-12 pb-8 border-b border-[#E2E8F0]">
          <div className="text-xs uppercase tracking-[0.18em] text-[#2563EB] font-bold mb-3">
            {topic.name}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#0F172A] leading-tight mb-5">
            {topic.title}
          </h1>
          <p className="text-lg text-[#475569] leading-relaxed max-w-3xl">
            {topic.intro}
          </p>
          <p className="mt-5 text-sm text-[#475569]">
            {updated && (
              <>
                Aggiornato al{' '}
                <time dateTime={updated}>{formatItalianDate(updated)}</time>
                {' · '}
              </>
            )}
            {total} notizie da {editions.length}{' '}
            {editions.length === 1 ? 'edizione' : 'edizioni'} · a cura di{' '}
            <Link
              href={FOUNDER.url}
              rel="author"
              className="font-semibold text-[#0F172A] hover:text-[#2563EB] transition-colors"
            >
              {FOUNDER.name}
            </Link>
          </p>
        </header>

        <div className="space-y-12">
          {editions.map((edition) => (
            <section key={edition.slug} aria-labelledby={`ed-${edition.slug}`}>
              <h2
                id={`ed-${edition.slug}`}
                className="text-sm font-semibold uppercase tracking-wider text-[#475569] mb-4"
              >
                {edition.date && (
                  <time dateTime={edition.date}>{formatItalianDate(edition.date)}</time>
                )}
                <span className="mx-2" aria-hidden="true">·</span>
                <Link
                  href={`/weekly/${edition.slug}`}
                  className="text-[#2563EB] hover:text-[#1d4ed8] normal-case tracking-normal"
                >
                  Edizione #{edition.issueNumber}: {edition.title}
                </Link>
              </h2>
              <ul className="space-y-5">
                {edition.items.map((item, i) => (
                  <li
                    key={i}
                    className="pl-5 border-l-2 border-[#E2E8F0] text-[#0F172A] leading-relaxed"
                  >
                    <p>{item.text}</p>
                    {item.sources.length > 0 && (
                      <p className="mt-1.5 text-sm text-[#475569]">
                        Fonti:{' '}
                        {item.sources.map((s, j) => (
                          <span key={j}>
                            {j > 0 && ', '}
                            <a
                              href={s.url}
                              target="_blank"
                              rel="nofollow noopener noreferrer"
                              className="underline decoration-[#CBD5E1] hover:text-[#2563EB]"
                            >
                              {s.name}
                            </a>
                          </span>
                        ))}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <aside className="mt-16 p-8 md:p-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-3 text-[#0F172A]">
            Ricevi la prossima edizione
          </h2>
          <p className="text-[#475569] mb-6 max-w-xl mx-auto">
            Ogni domenica gli sviluppi chiave sull&apos;AI in Europa e in
            Italia, con le fonti. Gratuita.
          </p>
          <Link
            href="/#subscribe"
            className="inline-block px-8 py-3 bg-[#2563EB] text-white font-semibold rounded-full hover:bg-[#1d4ed8] transition-colors shadow-lg shadow-[#2563EB]/20"
          >
            Iscriviti gratis
          </Link>
        </aside>

        <nav aria-label="Altri temi" className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#475569] mb-4">
            Altri temi
          </h2>
          <ul className="flex flex-wrap gap-3">
            {others.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/temi/${t.slug}`}
                  className="inline-block px-4 py-2 rounded-full border border-[#E2E8F0] text-sm font-semibold text-[#0F172A] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                >
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>

      <Footer />
    </>
  )
}
