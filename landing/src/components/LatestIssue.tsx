import Link from 'next/link'
import { getAllIssues } from '@/lib/newsletter-issues'
import {
  extractTopBullets,
  formatItalianDate,
  parseSlugDate,
  stripSlugPrefix,
} from '@/lib/newsletter-html'

// Server component — fetches the most recent published weekly issue at
// request time and renders a real excerpt. Falls back to a quiet "no issues
// yet" panel before the first edition ships.
export default async function LatestIssue() {
  const issues = await getAllIssues('weekly')
  const latest = issues[0]

  return (
    <section
      id="preview"
      className="py-24 bg-white"
      aria-labelledby="latest-heading"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="text-sm uppercase tracking-[0.18em] text-[#2563EB] font-bold mb-3">
            Ultima edizione
          </div>
          <h2
            id="latest-heading"
            className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight"
          >
            Un assaggio del contenuto
          </h2>
        </div>

        {!latest ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-10 text-center">
            <p className="text-lg text-[#475569] mb-6">
              La prima edizione è in arrivo. Iscriviti per riceverla.
            </p>
            <Link
              href="#subscribe"
              className="inline-block px-6 py-3 bg-[#2563EB] text-white font-semibold rounded-full hover:bg-[#1d4ed8] transition-colors"
            >
              Iscriviti gratis
            </Link>
          </div>
        ) : (
          <LatestIssueCard issue={latest} />
        )}
      </div>
    </section>
  )
}

function LatestIssueCard({
  issue,
}: {
  issue: Awaited<ReturnType<typeof getAllIssues>>[number]
}) {
  const urlSlug = stripSlugPrefix(issue.slug)
  const isoDate = parseSlugDate(issue.slug) || issue.published_at.slice(0, 10)
  const bullets = extractTopBullets(issue.html_content, 4)

  return (
    <article className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] overflow-hidden shadow-lg shadow-black/5">
      <header className="px-8 py-6 border-b border-[#E2E8F0] bg-white">
        <div className="text-sm font-semibold text-[#475569] mb-2">
          Edizione #{issue.issue_number}
          {isoDate && (
            <>
              {' · '}
              <time dateTime={isoDate}>{formatItalianDate(isoDate)}</time>
            </>
          )}
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-[#0F172A] leading-tight">
          {issue.title}
        </h3>
        {issue.dek && (
          <p className="mt-3 text-lg text-[#475569] leading-relaxed">
            {issue.dek}
          </p>
        )}
      </header>

      {bullets.length > 0 && (
        <div className="px-8 py-6">
          <ul className="space-y-4">
            {bullets.map((text, i) => (
              <li
                key={i}
                className="flex gap-4 text-[#0F172A] leading-relaxed"
              >
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
        </div>
      )}

      <footer className="px-8 py-6 border-t border-[#E2E8F0] bg-white flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <p className="text-base text-[#475569]">
          Vuoi la prossima nella tua inbox?
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/weekly/${urlSlug}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-[#E2E8F0] text-[#0F172A] font-semibold hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
          >
            Leggi l&apos;edizione
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link
            href="#subscribe"
            className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#2563EB] text-white font-semibold hover:bg-[#1d4ed8] transition-colors shadow-md shadow-[#2563EB]/25"
          >
            Iscriviti gratis
          </Link>
        </div>
      </footer>
    </article>
  )
}
