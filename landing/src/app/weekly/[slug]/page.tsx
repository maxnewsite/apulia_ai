import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAllIssues, getIssueBySlug } from '@/lib/newsletter-issues'
import { getReaderSession } from '@/lib/reader-session'
import { canReadIssue } from '@/lib/reader-gate'
import {
  extractBodyContent,
  issueDescription,
  extractTopBullets,
  formatItalianDate,
  parseSlugDate,
} from '@/lib/newsletter-html'
import { FOUNDER, founderRef } from '@/lib/seo-entities'
import { topicsInIssue } from '@/lib/topics'
import '../newsletter.css'

// Reso a ogni richiesta: il contenuto mostrato dipende dal cookie di
// sessione dell'iscritto, quindi non può essere una pagina statica condivisa
// fra chi ha accesso all'archivio e chi no.
export const dynamic = 'force-dynamic'

type Params = Promise<{ slug: string }>

export async function generateMetadata(
  { params }: { params: Params }
): Promise<Metadata> {
  const { slug } = await params
  const dbSlug = `weekly-${slug}`
  const issue = await getIssueBySlug(dbSlug)

  if (!issue) {
    return {
      title: 'Edizione non trovata',
      robots: { index: false, follow: false },
    }
  }

  const description =
    issueDescription(issue)
  const url = `https://apulia.ai/weekly/${slug}`

  return {
    title: issue.title,
    description,
    authors: [{ name: FOUNDER.name, url: FOUNDER.url }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: issue.title,
      description,
      type: 'article',
      url,
      publishedTime: issue.published_at,
      authors: [FOUNDER.url],
      tags: [
        'intelligenza artificiale',
        'EU AI Act',
        'startup AI Europa',
        'AI Italia',
      ],
      images: [
        {
          url: 'https://apulia.ai/apulia_ai.webp',
          width: 1200,
          height: 630,
          alt: issue.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: issue.title,
      description,
      images: ['https://apulia.ai/apulia_ai.webp'],
    },
  }
}

export default async function EditionPage({ params }: { params: Params }) {
  const { slug } = await params
  const dbSlug = `weekly-${slug}`
  const issue = await getIssueBySlug(dbSlug)

  if (!issue) notFound()

  const description =
    issueDescription(issue)
  const issueDate = parseSlugDate(issue.slug) || issue.published_at.slice(0, 10)
  const url = `https://apulia.ai/weekly/${slug}`

  // L'ultima edizione è pubblica; le precedenti sono il motivo per cui vale
  // la pena iscriversi, quindi si aprono solo con una sessione da iscritto.
  const issues = await getAllIssues('weekly')
  const latestSlug = issues[0]?.slug ?? null
  const session = await getReaderSession()
  const unlocked = canReadIssue(issue.slug, latestSlug, session !== null)

  const body = unlocked ? extractBodyContent(issue.html_content) : ''
  const teaser = unlocked ? [] : extractTopBullets(issue.html_content, 3)
  const issueTopics = topicsInIssue(issue.html_content)

  // NewsArticle JSON-LD — what Google News and AI search use to rank
  // editorial content. References the global Organization + Periodical
  // schemas defined in <SchemaOrg /> via @id.
  const newsArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': `${url}#article`,
    headline: issue.title,
    alternativeHeadline: issue.title_en || undefined,
    description,
    datePublished: issue.published_at,
    dateModified: issue.published_at,
    inLanguage: 'it-IT',
    isAccessibleForFree: unlocked,
    // Segnala a Google quale parte della pagina è dietro accesso: senza
    // questo, mostrare ai crawler meno testo che ai lettori è cloaking.
    hasPart: unlocked
      ? undefined
      : {
          '@type': 'WebPageElement',
          isAccessibleForFree: false,
          cssSelector: '.newsletter-body',
        },
    isPartOf: { '@id': 'https://apulia.ai/#weekly' },
    publisher: { '@id': 'https://apulia.ai/#organization' },
    // Autore = persona reale: per Google (E-E-A-T) e per gli LLM un contenuto
    // firmato da qualcuno con una pagina profilo pesa più di uno anonimo.
    author: founderRef,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    image: {
      '@type': 'ImageObject',
      url: 'https://apulia.ai/apulia_ai.webp',
      width: 1200,
      height: 630,
    },
    url,
    articleSection: [
      'Intelligenza Artificiale',
      'EU AI Act',
      'Startup AI',
      'Investimenti AI',
    ],
    keywords: [
      'intelligenza artificiale',
      'EU AI Act',
      'startup AI italiane',
      'AI Europa',
      'newsletter AI',
    ].join(', '),
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
      {
        '@type': 'ListItem',
        position: 3,
        name: `Edizione #${issue.issue_number}`,
        item: url,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Header />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-16">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 text-sm text-[#475569]"
        >
          <Link
            href="/"
            className="hover:text-[#0F172A] transition-colors"
          >
            Home
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <Link
            href="/weekly"
            className="hover:text-[#0F172A] transition-colors"
          >
            Archivio Weekly
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-[#0F172A]">
            Edizione #{issue.issue_number}
          </span>
        </nav>

        <header className="mb-10 pb-8 border-b border-[#E2E8F0]">
          <div className="text-xs uppercase tracking-wider text-[#475569] mb-3">
            AI Europa Weekly · Edizione #{issue.issue_number} ·{' '}
            <time dateTime={issueDate}>{formatItalianDate(issueDate)}</time>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#0F172A] leading-tight mb-4">
            {issue.title}
          </h1>
          {issue.dek && (
            <p className="text-lg text-[#475569] leading-relaxed">
              {issue.dek}
            </p>
          )}
          <p className="mt-5 text-sm text-[#475569]">
            di{' '}
            <Link
              href={FOUNDER.url}
              rel="author"
              className="font-semibold text-[#0F172A] hover:text-[#2563EB] transition-colors"
            >
              {FOUNDER.name}
            </Link>
            , {FOUNDER.jobTitle}
          </p>
          {issue.pdf_url && (
            <div className="mt-6">
              <a
                href={issue.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-full hover:border-[#2563EB] transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Scarica PDF
              </a>
            </div>
          )}
        </header>

        <article
          itemScope
          itemType="https://schema.org/NewsArticle"
          className="newsletter-article"
        >
          <meta itemProp="datePublished" content={issue.published_at} />
          <meta itemProp="headline" content={issue.title} />
          <meta itemProp="inLanguage" content="it-IT" />
          {unlocked ? (
            <div
              className="newsletter-body"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          ) : (
            <LockedIssue teaser={teaser} slug={slug} />
          )}
        </article>

        {issueTopics.length > 0 && (
          <nav aria-label="Temi di questa edizione" className="mt-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#475569] mb-4">
              Approfondisci per tema
            </h2>
            <ul className="flex flex-wrap gap-3">
              {issueTopics.map((t) => (
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
        )}

        <aside className="mt-16 p-8 md:p-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-3 text-[#0F172A]">
            Ricevi la prossima edizione
          </h2>
          <p className="text-[#475569] mb-6 max-w-xl mx-auto">
            Gratuita, ogni domenica pomeriggio. Pronta nella tua inbox per il
            lunedì mattina.
          </p>
          <Link
            href="/#subscribe"
            className="inline-block px-8 py-3 bg-[#2563EB] text-white font-semibold rounded-full hover:bg-[#1d4ed8] transition-colors shadow-lg shadow-[#2563EB]/20"
          >
            Iscriviti gratis
          </Link>
        </aside>

        <div className="mt-12 text-center">
          <Link
            href="/weekly"
            className="inline-flex items-center gap-2 text-sm text-[#475569] hover:text-[#0F172A] transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Tutte le edizioni
          </Link>
        </div>
      </main>

      <Footer />
    </>
  )
}

/**
 * Edizione di archivio senza sessione: si mostrano i primi punti e si chiede
 * l'accesso. Il titolo e l'occhiello restano visibili sopra — la pagina deve
 * dire di cosa parla anche a chi non è iscritto.
 */
function LockedIssue({ teaser, slug }: { teaser: string[]; slug: string }) {
  return (
    <div className="newsletter-locked">
      {teaser.length > 0 && (
        <ul className="space-y-4 mb-10">
          {teaser.map((text, i) => (
            <li key={i} className="flex gap-4 text-[#0F172A] leading-relaxed">
              <span
                className="font-mono text-2xl font-black text-[#2563EB]/40 leading-none flex-shrink-0"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-8 md:p-10 text-center">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="mx-auto mb-4 text-[#2563EB]"
        >
          <path
            d="M7 10V7a5 5 0 0110 0v3m-11 0h12a1 1 0 011 1v9a1 1 0 01-1 1H6a1 1 0 01-1-1v-9a1 1 0 011-1z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] mb-3">
          Il resto dell&apos;edizione è riservato agli iscritti
        </h2>
        <p className="text-[#475569] max-w-xl mx-auto mb-7 leading-relaxed">
          L&apos;archivio completo di AI Europa Weekly è accessibile a chi
          riceve la newsletter. L&apos;iscrizione è gratuita e l&apos;accesso
          avviene con un link inviato via email: nessuna password.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/accedi?next=${encodeURIComponent(`/weekly/${slug}`)}`}
            className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-[#2563EB] text-white font-semibold hover:bg-[#1d4ed8] transition-colors shadow-md shadow-[#2563EB]/25"
          >
            Accedi
          </Link>
          <Link
            href="/#subscribe"
            className="inline-flex items-center justify-center px-7 py-3 rounded-full border border-[#E2E8F0] text-[#0F172A] font-semibold hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
          >
            Iscriviti gratis
          </Link>
        </div>
      </div>
    </div>
  )
}
