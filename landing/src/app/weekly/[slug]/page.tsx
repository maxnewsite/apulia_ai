import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAllIssues, getIssueBySlug } from '@/lib/newsletter-issues'
import {
  extractBodyContent,
  extractDescription,
  formatItalianDate,
  parseSlugDate,
} from '@/lib/newsletter-html'
import '../newsletter.css'

// Revalidate every hour — new editions ship Sunday afternoon
export const revalidate = 3600
export const dynamicParams = true

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  const issues = await getAllIssues('weekly')
  return issues.map((i) => ({
    slug: i.slug.replace(/^weekly-/, ''),
  }))
}

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
    extractDescription(issue.html_content) || issue.dek || ''
  const url = `https://apulia.ai/weekly/${slug}`

  return {
    title: issue.title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: issue.title,
      description,
      type: 'article',
      url,
      publishedTime: issue.published_at,
      authors: ['apulia.ai'],
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

  const body = extractBodyContent(issue.html_content)
  const description =
    extractDescription(issue.html_content) || issue.dek || ''
  const issueDate = parseSlugDate(issue.slug) || issue.published_at.slice(0, 10)
  const url = `https://apulia.ai/weekly/${slug}`

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
    isAccessibleForFree: true,
    isPartOf: { '@id': 'https://apulia.ai/#weekly' },
    publisher: { '@id': 'https://apulia.ai/#organization' },
    author: { '@id': 'https://apulia.ai/#organization' },
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
          <Link
            href="/weekly"
            className="hover:text-[#F0F4FF] transition-colors"
          >
            Archivio Weekly
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-[#F0F4FF]">
            Edizione #{issue.issue_number}
          </span>
        </nav>

        <header className="mb-10 pb-8 border-b border-[#1E3A5F]">
          <div className="text-xs uppercase tracking-wider text-[#94A3B8] mb-3">
            AI Europa Weekly · Edizione #{issue.issue_number} ·{' '}
            <time dateTime={issueDate}>{formatItalianDate(issueDate)}</time>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#F0F4FF] leading-tight mb-4">
            {issue.title}
          </h1>
          {issue.dek && (
            <p className="text-lg text-[#94A3B8] leading-relaxed">
              {issue.dek}
            </p>
          )}
          {issue.pdf_url && (
            <div className="mt-6">
              <a
                href={issue.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#F0F4FF] bg-[#0F1A2E] border border-[#1E3A5F] rounded-full hover:border-[#2563EB] transition-colors"
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
          <div
            className="newsletter-body"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        </article>

        <aside className="mt-16 p-8 md:p-10 bg-[#0F1A2E] border border-[#1E3A5F] rounded-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-3 text-[#F0F4FF]">
            Ricevi la prossima edizione
          </h2>
          <p className="text-[#94A3B8] mb-6 max-w-xl mx-auto">
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
            className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F0F4FF] transition-colors"
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
