// Utilities to extract usable content from the full HTML documents the
// pipeline writes into newsletter_issues.html_content (which include
// <!DOCTYPE>, <head>, external stylesheet refs designed for PDF rendering).

export function extractBodyContent(fullHtml: string): string {
  if (!fullHtml) return ''
  const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  let body = bodyMatch ? bodyMatch[1] : fullHtml

  // Defensive: strip any script tags (we control the source but treat as untrusted)
  body = body.replace(/<script[\s\S]*?<\/script>/gi, '')

  // Strip the per-document <link rel="stylesheet"> — we provide our own styles
  body = body.replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, '')

  return body
}

export function extractDescription(fullHtml: string, max = 160): string {
  if (!fullHtml) return ''
  // Take the first bullet-text — it's the lead story of the edition
  const match = fullHtml.match(
    /<span class="bullet-text">([\s\S]*?)(<span class="bullet-sources"|<\/span>)/i
  )
  if (!match) return ''
  const text = match[1]
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= max) return text
  return text.slice(0, max).trim() + '…'
}

// Slug format from publish.py: "weekly-2026-05-23" or "monthly-2026-06-01"
export function parseSlugDate(slug: string): string | null {
  const m = slug.match(/(\d{4}-\d{2}-\d{2})$/)
  return m ? m[1] : null
}

export function stripSlugPrefix(slug: string): string {
  return slug.replace(/^(weekly|monthly)-/, '')
}

const MONTHS_IT = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
]

export function formatItalianDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]} ${d.getFullYear()}`
}
