import { getAllIssues } from '@/lib/newsletter-issues'
import { extractTopBullets, stripSlugPrefix } from '@/lib/newsletter-html'
import { FOUNDER, SITE_URL } from '@/lib/seo-entities'

// Feed RSS dell'archivio: canale di scoperta per aggregatori e crawler.
// Contiene titolo, occhiello e i primi punti di ogni edizione, non il testo
// completo: le edizioni d'archivio restano riservate agli iscritti.
export const revalidate = 3600

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const issues = await getAllIssues('weekly')
  const feedUrl = `${SITE_URL}/weekly/feed.xml`

  const items = issues
    .map((issue) => {
      const url = `${SITE_URL}/weekly/${stripSlugPrefix(issue.slug)}`
      const bullets = extractTopBullets(issue.html_content, 4)
      const summary = [issue.dek, ...bullets].filter(Boolean).join(' — ')
      return `    <item>
      <title>${escapeXml(issue.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(issue.published_at).toUTCString()}</pubDate>
      <dc:creator>${escapeXml(FOUNDER.name)}</dc:creator>
      <description>${escapeXml(summary)}</description>
    </item>`
    })
    .join('\n')

  const lastBuild = issues[0]
    ? new Date(issues[0].published_at).toUTCString()
    : new Date().toUTCString()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>AI Europa Weekly — apulia.ai</title>
    <link>${SITE_URL}/weekly</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <description>Ogni settimana gli sviluppi chiave sull'intelligenza artificiale in Europa e in Italia: EU AI Act, investimenti, startup, ricerca.</description>
    <language>it-IT</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
