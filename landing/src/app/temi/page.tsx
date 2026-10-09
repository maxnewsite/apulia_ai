import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAllIssues } from '@/lib/newsletter-issues'
import { SITE_URL } from '@/lib/seo-entities'
import { MIN_TOPIC_ITEMS, TOPICS, buildTopicEditions, countItems } from '@/lib/topics'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Temi — AI Act, investimenti, AI in Italia, data center',
  description:
    'Le notizie di AI Europa Weekly raccolte per tema: AI Act e normativa, investimenti nell’AI, intelligenza artificiale in Italia, data center e infrastrutture.',
  alternates: { canonical: `${SITE_URL}/temi` },
}

export default async function TopicsIndexPage() {
  const issues = await getAllIssues('weekly')
  const topics = TOPICS.map((t) => ({
    topic: t,
    count: countItems(buildTopicEditions(t, issues)),
  })).filter((t) => t.count >= MIN_TOPIC_ITEMS)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Temi', item: `${SITE_URL}/temi` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-16">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[#475569]">
          <Link href="/" className="hover:text-[#0F172A] transition-colors">
            Home
          </Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-[#0F172A]">Temi</span>
        </nav>

        <header className="mb-12 pb-8 border-b border-[#E2E8F0]">
          <div className="text-xs uppercase tracking-[0.18em] text-[#2563EB] font-bold mb-3">
            AI Europa Weekly
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] leading-tight mb-4">
            Le notizie per tema
          </h1>
          <p className="text-lg text-[#475569] max-w-2xl">
            Ogni settimana selezioniamo gli sviluppi sull&apos;intelligenza
            artificiale in Europa e in Italia. Qui li trovi raccolti per
            argomento, dal più recente, con le fonti originali.
          </p>
        </header>

        <ul className="grid gap-4 sm:grid-cols-2">
          {topics.map(({ topic, count }) => (
            <li key={topic.slug}>
              <Link
                href={`/temi/${topic.slug}`}
                className="block h-full p-6 md:p-7 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl hover:border-[#2563EB] transition-colors group"
              >
                <div className="text-xs uppercase tracking-wider text-[#475569] font-semibold mb-2">
                  {count} notizie
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors mb-2">
                  {topic.name}
                </h2>
                <p className="text-sm md:text-base text-[#475569] leading-relaxed">
                  {topic.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <Footer />
    </>
  )
}
